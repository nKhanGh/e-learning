package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.RegisterRequest;
import com.khangdev.elearningbe.dto.response.UserResponse;

public interface UserService {
    UserResponse register(RegisterRequest request);
}
