package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.authentication.*;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.authentication.AuthenticationResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.authentication.LogoutResponse;
import com.khangdev.elearningbe.dto.response.authentication.RefreshTokenResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/auth")
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) throws JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.login(request))
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody RegisterRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(authenticationService.register(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        return ApiResponse.<LogoutResponse>builder()
                .result(authenticationService.logout(request))
                .build();
    }

    @PostMapping("/refreshtToken")
    public ApiResponse<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) throws ParseException, JOSEException {
        return ApiResponse.<RefreshTokenResponse>builder()
                .result(authenticationService.refreshToken(request))
                .build();
    }

    @PostMapping("/verify-email")
    public ApiResponse<EmailVerifyResponse> verifyEmail(@RequestBody EmailVerifyRequest request) throws JOSEException {
        return ApiResponse.<EmailVerifyResponse>builder()
                .result(authenticationService.verifyEmail(request))
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody PasswordForgotRequest request) {
        authenticationService.forgotPassword(request);
        return ApiResponse.<Void>builder()
                .message("Email for reset password has been sent")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody PasswordResetRequest request) {
        authenticationService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been reset")
                .build();
    }
}
