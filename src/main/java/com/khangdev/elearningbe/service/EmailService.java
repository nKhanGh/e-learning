package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.email.EmailSendRequest;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.email.EmailResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;

public interface EmailService {
    EmailResponse sendEmail(EmailSendRequest emailSendRequest);
    void sendOtpEmail(String email);
    void sendChangePasswordEmail(String email);
    EmailVerifyResponse verifyEmail(EmailVerifyRequest emailVerifyRequest);
}
