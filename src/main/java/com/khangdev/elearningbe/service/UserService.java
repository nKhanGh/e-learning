package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.RegisterRequest;
import com.khangdev.elearningbe.dto.response.UserResponse;
import com.khangdev.elearningbe.enums.UserStatus;

public interface UserService {
    UserResponse register(RegisterRequest request);
    void setStatus(String email, UserStatus status);
    void resetPassword(String email, String password);
    UserResponse getMyInfo();
}
