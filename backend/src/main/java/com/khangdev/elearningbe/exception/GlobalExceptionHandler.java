package com.khangdev.elearningbe.exception;


import com.khangdev.elearningbe.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.metadata.ConstraintDescriptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.validation.ConstraintViolation;


import java.util.Date;
import java.util.Map;
import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();

        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotValidException(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        if(fieldError == null)
            throw new AppException(ErrorCode.INVALID_KEY);
        String enumKey = fieldError.getDefaultMessage();
        ErrorCode errorCode;
        Map<String, Object> attributes;
        try {
            errorCode = ErrorCode.valueOf(enumKey);
            var constraintViolation = fieldError.unwrap(ConstraintViolation.class);
            ConstraintDescriptor<?> descriptor = constraintViolation.getConstraintDescriptor();
            attributes = descriptor.getAttributes();
        } catch (IllegalArgumentException ex){
        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

        return ResponseEntity.status(errorCode.getStatusCode()).body(
            ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
            .message(Objects.nonNull(attributes)
                                ? mapAttribute(errorCode.getMessage(), attributes)
            : errorCode.getMessage()
            )
            .build()
        );
    }
    private String mapAttribute(String message, Map<String, Object> attributes){
        String minValue = attributes.get("min") != null
                ? attributes.get("min").toString()
                : "";
        return message.replace("{min}", minValue);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .error(exception.getMessage())
                .status(HttpStatus.BAD_REQUEST.value())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }
}
