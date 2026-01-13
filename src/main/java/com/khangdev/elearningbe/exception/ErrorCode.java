package com.khangdev.elearningbe.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error!", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_FOUND(400, "User not found", HttpStatus.BAD_REQUEST),
    USER_EXISTED(400, "User already existed", HttpStatus.CONFLICT),
    PASSWORD_INCORRECT(400, "Password incorrect", HttpStatus.BAD_REQUEST),

    INVALID_KEY(9998, "Invalid message key!", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "You do not have permission", HttpStatus.FORBIDDEN),
    CANNOT_SEND_EMAIL(400, "Cannot send email", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(400, "Email already existed", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(400, "Invalid email address", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_EXISTED(400, "Phone number already existed", HttpStatus.BAD_REQUEST),
    VERIFY_CODE_NOT_TRUE(400, "Verification code is expired or incorrect, please try again."
            , HttpStatus.BAD_REQUEST),
    TOO_MANY_ATTEMPTS(400, "There are too many attemps on this verification code!", HttpStatus.BAD_REQUEST),
    VERIFY_CODE_INVALID(400, "Verify code must be 6 character!", HttpStatus.BAD_REQUEST),
    USER_NOT_VERIFIED(400, "User is not verified!", HttpStatus.BAD_REQUEST),
    REPORT_TYPE_NOT_FOUND(400, "Report type not found", HttpStatus.BAD_REQUEST),
    INVALID_TIME_REPORT(400, "You can only report this target after 7 days from the first time!", HttpStatus.BAD_REQUEST),
    CONVERSATION_NOT_FOUND(400, "Conversation not found", HttpStatus.BAD_REQUEST),
    NOTIFICATION_NOT_FOUND(400, "Notification not found", HttpStatus.BAD_REQUEST),

    COURSE_CATEGORY_NOT_FOUND(400, "Category not found", HttpStatus.BAD_REQUEST),
    COURSE_NOT_FOUND(400, "Course not found", HttpStatus.BAD_REQUEST),
    COURSE_TAG_NOT_FOUND(400, "Course tag not found", HttpStatus.BAD_REQUEST),
    COURSE_SECTION_NOT_FOUND(400, "Course section not found", HttpStatus.BAD_REQUEST),

    LECTURE_NOT_FOUND(400, "Lecture not found", HttpStatus.BAD_REQUEST),
    QUIZ_NOT_FOUND(400, "Quiz not found", HttpStatus.BAD_REQUEST),
    QUIZ_EXISTED(400, "Quiz already existed", HttpStatus.BAD_REQUEST),
    QUIZ_QUESTION_NOT_FOUND(400, "Quiz question not found", HttpStatus.BAD_REQUEST),

    ENROLLMENT_NOT_FOUND(400, "Enrollment not found", HttpStatus.BAD_REQUEST),
    QUIZ_ATTEMPT_NOT_FOUND(400, "Quiz attempt not found", HttpStatus.BAD_REQUEST),

    QUIZ_ATTEMPT_INVALID(401, "You must complete the quiz you previously participated in.", HttpStatus.BAD_REQUEST),
    ;

    int code;
    String message;
    HttpStatusCode statusCode;
}
