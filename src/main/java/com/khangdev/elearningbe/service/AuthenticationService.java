package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.*;
import com.khangdev.elearningbe.dto.response.*;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse login(AuthenticationRequest request) throws JOSEException;
    LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException;
    RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException;
    UserResponse register(RegisterRequest request);
    EmailVerifyResponse verifyEmail(EmailVerifyRequest request) throws JOSEException;
    void forgotPassword(PasswordForgotRequest request);
    void resetPassword(PasswordResetRequest request);
}
