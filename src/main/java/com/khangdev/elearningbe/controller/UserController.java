package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.user.InstructorCreationRequest;
import com.khangdev.elearningbe.dto.request.user.UserUpdateRequest;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/users")
public class UserController {
    UserService userService;

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(
            @PathVariable UUID userId,
            @RequestPart(value = "data", required = true) UserUpdateRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ){
        return ApiResponse.<UserResponse>builder()
                .result(userService.update(userId, request, avatar))
                .build();
    }

    @PutMapping("/my-profile")
    ApiResponse<UserResponse> updateMyProfile(
            @RequestPart(value = "data", required = true) UserUpdateRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ){
        return ApiResponse.<UserResponse>builder()
                .result(userService.update(userService.getMyInfo().getId(), request, avatar))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Void> deleteUser(@PathVariable UUID userId){
        userService.deleteUser(userId);
        return ApiResponse.<Void>builder()
                .message("User deleted successfully!")
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable UUID userId){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .build();
    }

    @GetMapping("/course/{courseId}")
    ApiResponse<PageResponse<UserResponse>> getUserCourse(
            @PathVariable UUID courseId,
            @RequestParam(value = "0", required = true) int page,
            @RequestParam(value = "10", required = true) int size
    ){
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .result(userService.getUserInCourse(courseId, page, size))
                .build();
    }

    @PostMapping("/instructor")
    ApiResponse<UserResponse> createInstructor(@RequestBody InstructorCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createInstructor(request))
                .build();
    }

}
