package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.response.authentication.AuthenticationResponse;
import com.khangdev.elearningbe.dto.response.authentication.EmailVerifyResponse;
import com.khangdev.elearningbe.dto.response.authentication.LogoutResponse;
import com.khangdev.elearningbe.dto.response.authentication.RefreshTokenResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.Map;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationService authenticationService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
    }

    @Test
    void login_success() throws Exception {
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .build();
        Mockito.when(authenticationService.login(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper
                                .writeValueAsString(Map.of("email", "test@example.com", "password", "123456"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void register_success() throws Exception {
        UserResponse response = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        Mockito.when(authenticationService.register(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper
                                .writeValueAsString(Map.of("email", "test@example.com", "password", "123456"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void logout_success() throws Exception {
        LogoutResponse response = LogoutResponse.builder()
                .result(true)
                .build();

        Mockito.when(authenticationService.logout(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", "refresh"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void refreshToken_success() throws Exception {
        RefreshTokenResponse response = RefreshTokenResponse.builder()
                .accessToken("new-access")
                .refreshToken("new-refresh")
                .build();

        Mockito.when(authenticationService.refreshToken(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/refreshtToken")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", "refresh"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void verifyEmail_success() throws Exception {
        EmailVerifyResponse response = EmailVerifyResponse.builder()
                .valid(true)
                .accessToken("access")
                .refreshToken("refresh")
                .build();

        Mockito.when(authenticationService.verifyEmail(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("token", "token"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void forgotPassword_success() throws Exception {
        Mockito.doNothing().when(authenticationService).forgotPassword(ArgumentMatchers.any());

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("email", "test@example.com"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message")
                        .value("Email for reset password has been sent"));
    }

    @Test
    void resetPassword_success() throws Exception {
        Mockito.doNothing().when(authenticationService).resetPassword(ArgumentMatchers.any());

        mockMvc.perform(
                MockMvcRequestBuilders.post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("token", "token", "newPassword", "123456"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message")
                        .value("Password has been reset"));
    }
}