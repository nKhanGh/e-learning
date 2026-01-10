package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.authentication.*;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.response.authentication.AuthenticationResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.authentication.LogoutResponse;
import com.khangdev.elearningbe.dto.response.authentication.RefreshTokenResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.*;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    EmailService emailService;
    UserService userService;
    JwtService jwtService;
    RedisService redisService;

    @Override
    public AuthenticationResponse login(AuthenticationRequest request) throws JOSEException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if(user.getStatus() == UserStatus.PENDING)
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if(!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        String accessToken = jwtService.generateToken(user, true);
        String refreshToken = jwtService.generateToken(user, false);
        return AuthenticationResponse.builder()
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .build();
    }

    private void saveTokenToRedis(String token, boolean isAccess) throws ParseException, JOSEException {
        SignedJWT signedJWT = jwtService.verifyToken(token, isAccess);
        String id = signedJWT.getJWTClaimsSet().getJWTID();
        long duration = signedJWT.getJWTClaimsSet().getExpirationTime().getTime() - System.currentTimeMillis();
        redisService.setValue("auth:blacklist:" + id, token, duration, TimeUnit.MILLISECONDS);
    }

    @Override
    public LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException {
        saveTokenToRedis(request.getAccessToken(), true);
        saveTokenToRedis(request.getRefreshToken(), false);
        return LogoutResponse.builder()
                .result(true)
                .build();
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException {
        String token = request.getRefreshToken();
        SignedJWT signedJWT = jwtService.verifyToken(token, false);
        String email = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String accessToken = jwtService.generateToken(user, true);
        String refreshToken = jwtService.generateToken(user, false);
        return RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public UserResponse register(RegisterRequest request) {
        UserResponse userResponse = userService.register(request);
        emailService.sendOtpEmail(request.getEmail());
        return userResponse;
    }

    @Override
    public EmailVerifyResponse verifyEmail(EmailVerifyRequest request) throws JOSEException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        EmailVerifyResponse response = emailService.verifyEmail(request);
        if(response.isValid()){
            userService.setStatus(request.getEmail(), UserStatus.ACTIVE);
            response.setAccessToken(jwtService.generateToken(user, true));
            response.setRefreshToken(jwtService.generateToken(user, false));
        }
        return response;
    }

    @Override
    public void forgotPassword(PasswordForgotRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        String oldToken = redisService.getValue("RESET_PASSWORD:" + request.getEmail());
        if (oldToken != null) {
            redisService.deleteKey("RESET_PASSWORD:" + oldToken);
        }
        emailService.sendChangePasswordEmail(request.getEmail());
    }

    @Override
    public void resetPassword(PasswordResetRequest request) {
        String token = request.getToken();
        String email = redisService.getValue("RESET_PASSWORD:" + token);
        if(email == null){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        redisService.deleteKey("RESET_PASSWORD:" + email);
        redisService.deleteKey("RESET_PASSWORD:" + token);
        userService.resetPassword(email, request.getPassword());
    }
}
