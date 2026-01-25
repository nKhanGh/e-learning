package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.email.EmailSendRequest;
import com.khangdev.elearningbe.dto.request.email.MailRecipient;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.email.EmailResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.httpClient.EmailClient;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(properties = {
        "email.apiKey=test-key",
        "email.mailSender=test@learnio.com",
        "app.frontendUrl=http://localhost",
        "app.baseUrl=http://localhost"
})
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @MockBean
    private EmailClient emailClient;

    @MockBean
    private RedisService redisService;

    @Test
    void sendEmail_success() {
        EmailSendRequest request = EmailSendRequest.builder()
                .recipient(MailRecipient.builder().email("user@example.com").name("User").build())
                .subject("Hello")
                .htmlContent("<p>Hello</p>")
                .build();

        EmailResponse response = EmailResponse.builder().messageId("msg-1").build();

        Mockito.when(emailClient.sendEmail(ArgumentMatchers.anyString(), ArgumentMatchers.any()))
                .thenReturn(response);

        EmailResponse result = emailService.sendEmail(request);

        Assertions.assertThat(result.getMessageId()).isEqualTo("msg-1");
    }

    @Test
    void sendOtpEmail_success() {
        Mockito.when(emailClient.sendEmail(ArgumentMatchers.anyString(), ArgumentMatchers.any()))
                .thenReturn(EmailResponse.builder().messageId("msg-1").build());
        Mockito.when(redisService.increment(ArgumentMatchers.anyString(), ArgumentMatchers.anyLong()))
                .thenReturn(1L);

        emailService.sendOtpEmail("user@example.com");

        Mockito.verify(emailClient, Mockito.atLeastOnce()).sendEmail(ArgumentMatchers.anyString(),
                ArgumentMatchers.any());
        Mockito.verify(redisService, Mockito.atLeastOnce()).setValue(ArgumentMatchers.startsWith("OTP:"),
                ArgumentMatchers.anyString(), ArgumentMatchers.anyLong(), ArgumentMatchers.any());
    }

    @Test
    void sendChangePasswordEmail_success() {
        Mockito.when(emailClient.sendEmail(ArgumentMatchers.anyString(), ArgumentMatchers.any()))
                .thenReturn(EmailResponse.builder().messageId("msg-2").build());

        emailService.sendChangePasswordEmail("user@example.com");

        Mockito.verify(redisService, Mockito.times(2)).setValue(ArgumentMatchers.startsWith("RESET_PASSWORD:"),
                ArgumentMatchers.anyString(), ArgumentMatchers.anyLong(), ArgumentMatchers.any());
    }

    @Test
    void verifyEmail_success() {
        EmailVerifyRequest request = EmailVerifyRequest.builder()
                .email("user@example.com")
                .verifyCode("123456")
                .build();

        Mockito.when(redisService.increment(ArgumentMatchers.anyString(), ArgumentMatchers.anyLong()))
                .thenReturn(1L);
        Mockito.when(redisService.getValue("OTP:" + request.getEmail()))
                .thenReturn("123456");

        EmailVerifyResponse result = emailService.verifyEmail(request);

        Assertions.assertThat(result.isValid()).isTrue();
        Mockito.verify(redisService).deleteKey("OTP_ATTEMPTS:" + request.getEmail());
        Mockito.verify(redisService).deleteKey("OTP:" + request.getEmail());
    }

    @Test
    void verifyEmail_tooManyAttempts_throwException() {
        EmailVerifyRequest request = EmailVerifyRequest.builder()
                .email("user@example.com")
                .verifyCode("123456")
                .build();

        Mockito.when(redisService.increment(ArgumentMatchers.anyString(), ArgumentMatchers.anyLong()))
                .thenReturn(6L);

        Assertions.assertThatThrownBy(() -> emailService.verifyEmail(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.TOO_MANY_ATTEMPTS);
    }
}