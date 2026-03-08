package com.khangdev.elearningbe.service.user;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.user.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.authentication.RegisterRequest;
import com.khangdev.elearningbe.dto.request.user.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.enums.UserStatus;
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
    List<UserResponse> searchUsers(String keyword);
}
