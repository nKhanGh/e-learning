package com.khangdev.elearningbe.service.impl.common;

import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.request.email.*;
import com.khangdev.elearningbe.dto.response.email.EmailResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.httpClient.EmailClient;
import com.khangdev.elearningbe.service.common.EmailService;
import com.khangdev.elearningbe.service.common.RedisService;
import com.khangdev.elearningbe.utils.TokenGenerator;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailServiceImpl implements EmailService {
    EmailClient emailClient;

    @NonFinal
    @Value("${email.apiKey}")
    private String apiKey;

    @NonFinal
    @Value("${email.mailSender}")
    private String mailSender;

    @NonFinal
    @Value("${app.frontendUrl}")
    private String baseUrl;

    Random random = new Random();

    RedisService redisService;

    private String generate6Digit(String email){
        int number = random.nextInt(1000000);
        String code = "%06d".formatted(number);
        redisService.setValue("OTP:" + email, code, 1, TimeUnit.MINUTES);
        redisService.setValue("OTP_ATTEMPTS:" + email, "0", 1, TimeUnit.MINUTES);
        return code;
    }

    public MailRecipient createRecipient(String email){
        return MailRecipient.builder()
                .email(email)
                .name("You")
                .build();
    }

    @Override
    public EmailResponse sendEmail(EmailSendRequest emailSendRequest) {
        EmailRequest request = EmailRequest.builder()
                .sender(MailSender.builder()
                        .name("Learnio")
                        .email(mailSender)
                        .build()
                )
                .to(List.of(emailSendRequest.getRecipient()))
                .subject(emailSendRequest.getSubject())
                .htmlContent(emailSendRequest.getHtmlContent())
                .build();
        try{
            return emailClient.sendEmail(apiKey, request);
        } catch (FeignException e){
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }

    @Override
    public void sendOtpEmail(String email){
        String code = generate6Digit(email);
        MailRecipient to = createRecipient(email);
        EmailSendRequest request = EmailSendRequest.builder()
                .recipient(to)
                .subject("Verification code")
                .htmlContent("<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden;\"><div style=\"background-color: #0795DF; color: white; text-align: center; padding: 20px; font-size: 22px; font-weight: bold;\">Verification Code</div><div style=\"background-color: #D6EAF8; padding: 20px; color: #333; font-size: 16px; line-height: 1.5;\"><p>To verify your account, enter this code in Learnio:</p><p style=\"font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;\">"+code+"</p><p>Verification codes expire after 60 seconds.</p><p>If you didn't request this code, you can ignore this message.</p></div></div>")
                .build();
        try{
            sendEmail(request);

        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendChangePasswordEmail(String email) {
        String resetUrl = "/reset-password?token=";
        String token = TokenGenerator.generateResetToken();
        redisService.setValue("RESET_PASSWORD:" +email, token, 15, TimeUnit.MINUTES);
        redisService.setValue("RESET_PASSWORD:" + token, email, 15, TimeUnit.MINUTES);
        String passwordResetHtml = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(135deg, #f5f7fa 0%%, #c3cfe2 100%%);
                  margin: 0;
                  padding: 20px;
                  min-height: 100vh;
                }
                .container {
                  max-width: 500px;
                  margin: 0 auto;
                  background: #ffffff;
                  border-radius: 16px;
                  box-shadow: 0 8px 32px rgba(7, 149, 223, 0.15);
                  overflow: hidden;
                }
                .header {
                  background: linear-gradient(135deg, #0795DF 0%%, #0568a3 100%%);
                  padding: 40px 30px;
                  text-align: center;
                }
                .logo {
                  font-size: 32px;
                  font-weight: 700;
                  color: #ffffff;
                  margin: 0;
                  letter-spacing: 1px;
                }
                .subtitle {
                  color: rgba(255, 255, 255, 0.9);
                  font-size: 14px;
                  margin: 8px 0 0 0;
                }
                .content {
                  padding: 50px 40px;
                  text-align: center;
                  background: #ffffff;
                }
                .icon {
                  width: 60px;
                  height: 60px;
                  background: linear-gradient(135deg, #0795DF 0%%, #0568a3 100%%);
                  border-radius: 50%%;
                  text-align: center;
                  line-height: 60px;
                  margin: 0 auto 25px;
                  font-size: 24px;
                  color: white;
                }
                .title {
                  font-size: 26px;
                  font-weight: 600;
                  color: #2c3e50;
                  margin-bottom: 15px;
                  line-height: 1.2;
                }
                .text {
                  font-size: 16px;
                  color: #5a6c7d;
                  margin-bottom: 35px;
                  line-height: 1.6;
                  max-width: 380px;
                  margin-left: auto;
                  margin-right: auto;
                }
                .button {
                  display: inline-block;
                  padding: 16px 32px;
                  background: linear-gradient(135deg, #0795DF 0%%, #0568a3 100%%);
                  color: #fff;
                  text-decoration: none;
                  border-radius: 25px;
                  font-weight: 600;
                  font-size: 16px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 15px rgba(7, 149, 223, 0.3);
                  letter-spacing: 0.5px;
                }
                .button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(7, 149, 223, 0.4);
                }
                .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent, #e1e8ed, transparent);
                  margin: 35px 0;
                }
                .security-info {
                  background: #f8fafc;
                  border-left: 4px solid #0795DF;
                  padding: 18px 22px;
                  border-radius: 8px;
                  text-align: left;
                  margin-top: 30px;
                }
                .security-info h4 {
                  color: #0795DF;
                  font-size: 16px;
                  font-weight: 600;
                  margin: 0 0 8px 0;
                }
                .security-info p {
                  color: #5a6c7d;
                  font-size: 14px;
                  margin: 0;
                  line-height: 1.5;
                }
                .footer {
                  padding: 30px 40px;
                  font-size: 14px;
                  color: #8492a6;
                  text-align: center;
                  background: #f8fafc;
                  border-top: 1px solid #e1e8ed;
                }
                .footer p {
                  margin: 5px 0;
                  line-height: 1.5;
                }
                .expire-notice {
                  background: rgba(255, 193, 7, 0.1);
                  color: #856404;
                  padding: 12px 18px;
                  border-radius: 6px;
                  font-size: 14px;
                  margin: 20px 0;
                  border: 1px solid rgba(255, 193, 7, 0.3);
                }
                @media (max-width: 600px) {
                  body {
                    padding: 10px;
                  }
                  .container {
                    margin: 0;
                    border-radius: 12px;
                  }
                  .header {
                    padding: 30px 20px;
                  }
                  .content {
                    padding: 30px 25px;
                  }
                  .footer {
                    padding: 20px 25px;
                  }
                  .logo {
                    font-size: 28px;
                  }
                  .title {
                    font-size: 22px;
                  }
                  .button {
                    padding: 14px 28px;
                    font-size: 15px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">Learnio</div>
                  <p class="subtitle">Your Career Journey Starts Here</p>
                </div>
                <div class="content">
                  <div class="icon">🔐</div>
                  <h1 class="title">Reset Your Password</h1>
                  <p class="text">
                    We received a request to reset your password for your Learnio account.
                    Click the button below to create a new secure password.
                  </p>
                  <a href="%s" class="button" style="color: #ffffff !important;">Reset My Password</a>
                  <div class="expire-notice">
                    ⏱️ This link will expire in 15 minutes for security
                  </div>
                  <div class="divider"></div>
                  <div class="security-info">
                    <h4>🛡️ Security Notice</h4>
                    <p>If you didn't request this password reset, please ignore this email. Your account remains secure and no changes will be made.</p>
                  </div>
                </div>
                <div class="footer">
                  <p><strong>Need help?</strong> Contact our support team anytime.</p>
                  <p>Learnio Team | support@learnio.com</p>
                  <p style="color: #a0aec0; font-size: 12px;">© 2025 Learnio. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(baseUrl + resetUrl + token);
        MailRecipient recipient = createRecipient(email);
        EmailSendRequest request = EmailSendRequest
                .builder()
                .recipient(recipient)
                .subject("Reset your password")
                .htmlContent(passwordResetHtml)
                .build();
        try{
            sendEmail(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public EmailVerifyResponse verifyEmail(EmailVerifyRequest emailVerifyRequest) {
        String key = "OTP:" + emailVerifyRequest.getEmail();
        String attemptsKey = "OTP_ATTEMPTS:" + emailVerifyRequest.getEmail();
        Long attempts = redisService.increment(attemptsKey, 1);
        if(attempts != null && attempts > 5){
            throw new AppException(ErrorCode.TOO_MANY_ATTEMPTS);
        }
        boolean result = false;
        String savedCode = redisService.getValue(key);
        if(savedCode != null && savedCode.equals(emailVerifyRequest.getVerifyCode())){
            result = true;
            redisService.deleteKey(attemptsKey);
            redisService.deleteKey(key);
        }
        return EmailVerifyResponse.builder().valid(result).build();
    }
}
