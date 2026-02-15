package com.khangdev.elearningbe.service.user;

import com.khangdev.elearningbe.dto.request.authentication.*;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.authentication.AuthenticationResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.authentication.LogoutResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse login(AuthenticationRequest request) throws JOSEException;
    LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException;
    AuthenticationResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException;
    UserResponse register(RegisterRequest request);
    EmailVerifyResponse verifyEmail(EmailVerifyRequest request) throws JOSEException;
    void forgotPassword(PasswordForgotRequest request);
    void resetPassword(PasswordResetRequest request);
}
