package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.authentication.AuthenticationRequest;
import com.khangdev.elearningbe.dto.request.authentication.EmailVerifyRequest;
import com.khangdev.elearningbe.dto.request.authentication.LogoutRequest;
import com.khangdev.elearningbe.dto.request.authentication.PasswordForgotRequest;
import com.khangdev.elearningbe.dto.request.authentication.PasswordResetRequest;
import com.khangdev.elearningbe.dto.request.authentication.RefreshTokenRequest;
import com.khangdev.elearningbe.dto.request.authentication.RegisterRequest;
import com.khangdev.elearningbe.dto.response.authentication.AuthenticationResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.authentication.LogoutResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.common.EmailService;
import com.khangdev.elearningbe.service.common.JwtService;
import com.khangdev.elearningbe.service.common.RedisService;
import com.khangdev.elearningbe.service.user.AuthenticationService;
import com.khangdev.elearningbe.service.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;

@SpringBootTest
public class AuthenticationServiceTest {

    @Autowired
    private AuthenticationService authenticationService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailService emailService;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private RedisService redisService;

    @Test
    void login_success() throws Exception {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("user@example.com")
                .password("123456")
                .build();

        User user = User.builder()
                .email("user@example.com")
                .status(UserStatus.ACTIVE)
                .password("encoded")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));
        Mockito.when(passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .thenReturn(true);
        Mockito.when(jwtService.generateToken(user, true))
                .thenReturn("access");
        Mockito.when(jwtService.generateToken(user, false))
                .thenReturn("refresh");

        AuthenticationResponse response = authenticationService.login(request);

        Assertions.assertThat(response.getAccessToken()).isEqualTo("access");
        Assertions.assertThat(response.getRefreshToken()).isEqualTo("refresh");
    }

    @Test
    void register_success() {
        RegisterRequest request = RegisterRequest.builder()
                .email("user@example.com")
                .password("123456")
                .build();

        UserResponse response = UserResponse.builder()
                .email("user@example.com")
                .build();

        Mockito.when(userService.register(ArgumentMatchers.any(RegisterRequest.class)))
                .thenReturn(response);

        UserResponse result = authenticationService.register(request);

        Assertions.assertThat(result.getEmail()).isEqualTo("user@example.com");
        Mockito.verify(emailService).sendOtpEmail("user@example.com");
    }

    @Test
    void login_userNotFound_throwException() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("missing@example.com")
                .password("123456")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> authenticationService.login(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
    }

    @Test
    void login_pendingUser_throwException() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("pending@example.com")
                .password("123456")
                .build();

        User user = User.builder()
                .email("pending@example.com")
                .status(UserStatus.PENDING)
                .password("encoded")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));

        Assertions.assertThatThrownBy(() -> authenticationService.login(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void login_wrongPassword_throwException() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("user@example.com")
                .password("wrong")
                .build();

        User user = User.builder()
                .email("user@example.com")
                .status(UserStatus.ACTIVE)
                .password("encoded")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));
        Mockito.when(passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .thenReturn(false);

        Assertions.assertThatThrownBy(() -> authenticationService.login(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void forgotPassword_userNotFound_throwException() {
        PasswordForgotRequest request = PasswordForgotRequest.builder()
                .email("missing@example.com")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> authenticationService.forgotPassword(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USER_NOT_FOUND);
    }

    @Test
    void resetPassword_invalidToken_throwException() {
        PasswordResetRequest request = PasswordResetRequest.builder()
                .token("invalid")
                .password("newpass")
                .build();

        Mockito.when(redisService.getValue("RESET_PASSWORD:" + request.getToken()))
                .thenReturn(null);

        Assertions.assertThatThrownBy(() -> authenticationService.resetPassword(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void logout_success() throws Exception {
        LogoutRequest request = LogoutRequest.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .build();

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .jwtID("jwt-id")
                .expirationTime(new Date(System.currentTimeMillis() + 60000))
                .build();
        SignedJWT signedJWT = Mockito.mock(SignedJWT.class);
        Mockito.when(signedJWT.getJWTClaimsSet()).thenReturn(claims);

        Mockito.when(jwtService.verifyToken("access", true)).thenReturn(signedJWT);
        Mockito.when(jwtService.verifyToken("refresh", false)).thenReturn(signedJWT);

        LogoutResponse response = authenticationService.logout(request);

        Assertions.assertThat(response.isResult()).isTrue();
        Mockito.verify(redisService, Mockito.times(2))
                .setValue(Mockito.anyString(), Mockito.anyString(), Mockito.anyLong(), Mockito.any());
    }

    @Test
    void refreshToken_success() throws Exception {
        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken("refresh")
                .build();

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject("user@example.com")
                .expirationTime(new Date(System.currentTimeMillis() + 60000))
                .build();
        SignedJWT signedJWT = Mockito.mock(SignedJWT.class);
        Mockito.when(signedJWT.getJWTClaimsSet()).thenReturn(claims);

        User user = User.builder().email("user@example.com").status(UserStatus.ACTIVE).build();

        Mockito.when(jwtService.verifyToken("refresh", false)).thenReturn(signedJWT);
        Mockito.when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        Mockito.when(jwtService.generateToken(user, true)).thenReturn("access");
        Mockito.when(jwtService.generateToken(user, false)).thenReturn("refresh");

        AuthenticationResponse response = authenticationService.refreshToken(request);

        Assertions.assertThat(response.getAccessToken()).isEqualTo("access");
        Assertions.assertThat(response.getRefreshToken()).isEqualTo("refresh");
    }

    @Test
    void verifyEmail_valid_success() throws Exception {
        EmailVerifyRequest request = EmailVerifyRequest.builder()
                .email("user@example.com")
                .verifyCode("123456")
                .build();

        User user = User.builder().email("user@example.com").status(UserStatus.PENDING).build();
        EmailVerifyResponse verifyResponse = EmailVerifyResponse.builder().valid(true).build();

        Mockito.when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        Mockito.when(emailService.verifyEmail(request)).thenReturn(verifyResponse);
        Mockito.when(jwtService.generateToken(user, true)).thenReturn("access");
        Mockito.when(jwtService.generateToken(user, false)).thenReturn("refresh");

        EmailVerifyResponse result = authenticationService.verifyEmail(request);

        Assertions.assertThat(result.isValid()).isTrue();
        Assertions.assertThat(result.getAccessToken()).isEqualTo("access");
        Assertions.assertThat(result.getRefreshToken()).isEqualTo("refresh");
        Mockito.verify(userService).setStatus("user@example.com", UserStatus.ACTIVE);
    }

    @Test
    void forgotPassword_success() {
        PasswordForgotRequest request = PasswordForgotRequest.builder()
                .email("user@example.com")
                .build();

        User user = User.builder().email("user@example.com").status(UserStatus.ACTIVE).build();

        Mockito.when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(redisService.getValue("RESET_PASSWORD:" + request.getEmail())).thenReturn("old");

        authenticationService.forgotPassword(request);

        Mockito.verify(redisService).deleteKey("RESET_PASSWORD:" + "old");
        Mockito.verify(emailService).sendChangePasswordEmail("user@example.com");
    }

    @Test
    void resetPassword_success() {
        PasswordResetRequest request = PasswordResetRequest.builder()
                .token("token")
                .password("newpass")
                .build();

        Mockito.when(redisService.getValue("RESET_PASSWORD:" + request.getToken()))
                .thenReturn("user@example.com");

        authenticationService.resetPassword(request);

        Mockito.verify(redisService).deleteKey("RESET_PASSWORD:" + "user@example.com");
        Mockito.verify(redisService).deleteKey("RESET_PASSWORD:" + "token");
        Mockito.verify(userService).resetPassword("user@example.com", "newpass");
    }
}
