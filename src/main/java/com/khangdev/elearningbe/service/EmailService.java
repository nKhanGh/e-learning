package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.EmailSendRequest;
import com.khangdev.elearningbe.dto.request.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.EmailResponse;
import com.khangdev.elearningbe.dto.response.EmailVerifyResponse;

public interface EmailService {
    EmailResponse sendEmail(EmailSendRequest emailSendRequest);
    void sendOtpEmail(String email);
    void sendChangePasswordEmail(String email);
    EmailVerifyResponse verifyEmail(EmailVerifyRequest emailVerifyRequest);
}
