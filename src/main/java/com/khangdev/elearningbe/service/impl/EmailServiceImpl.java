package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.EmailSendRequest;
import com.khangdev.elearningbe.dto.request.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.EmailResponse;
import com.khangdev.elearningbe.dto.response.EmailVerifyResponse;
import com.khangdev.elearningbe.service.EmailService;

public class EmailServiceImpl implements EmailService {

    @Override
    public EmailResponse sendEmail(EmailSendRequest emailSendRequest) {
        return null;
    }

    @Override
    public void sendOtpEmail(String email) {

    }

    @Override
    public void sendChangePasswordEmail(String email) {

    }

    @Override
    public EmailVerifyResponse verifyEmail(EmailVerifyRequest emailVerifyRequest) {
        return null;
    }
}
