package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.RegisterRequest;
import com.khangdev.elearningbe.dto.request.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.UserResponse;
import com.khangdev.elearningbe.enums.UserStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse register(RegisterRequest request);
    void setStatus(String email, UserStatus status);
    void resetPassword(String email, String password);
    UserResponse getMyInfo();
    void deleteUser(UUID id);
    UserResponse update(UUID userId, UserUpdateRequest request, MultipartFile avatarFile);
    UserResponse getUserById(UUID id);
    PageResponse<UserResponse> getUserInCourse(UUID courseId, int page, int size);
    UserResponse createInstructor(InstructorCreationRequest request);
}
