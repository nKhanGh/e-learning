package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.service.course.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService  enrollmentService;

    @PostMapping("/courses/{courseId}/enrollments")
    public ApiResponse<EnrollmentResponse> create(@PathVariable UUID courseId){
        return ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.createEnrollment(courseId))
                .message("Enrollment created successfully")
                .build();
    }

    @GetMapping("/courses/{courseId}/enrollments")
    public ApiResponse<List<EnrollmentResponse>> getEnrollmentsByCourseId(@PathVariable UUID courseId){
        return ApiResponse.<List<EnrollmentResponse>>builder()
                .result(enrollmentService.getEnrollmentsByCourseId(courseId))
                .message("Enrollments found successfully")
                .build();
    }

    @GetMapping("/users/{userId}/enrollments")
    public ApiResponse<List<EnrollmentResponse>> getEnrollmentsByUserId(@PathVariable UUID userId){
        return ApiResponse.<List<EnrollmentResponse>>builder()
                .result(enrollmentService.getEnrollmentsByUserId(userId))
                .message("Enrollments found successfully")
                .build();
    }

    @GetMapping("/courses/{courseId}/users/{userId}/enrollments")
    public ApiResponse<EnrollmentResponse> getEnrollment(@PathVariable UUID courseId, @PathVariable UUID userId){
        return ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.getEnrollmentById(
                        EnrollmentId.builder()
                                .userId(userId)
                                .courseId(courseId)
                                .build()
                ))
                .message("Enrollment found successfully")
                .build();
    }

    @PutMapping("/courses/{courseId}/access")
    public ApiResponse<EnrollmentResponse> access(@PathVariable UUID courseId){
        return ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.access(courseId))
                .build();
    }

    @PutMapping("/courses/{courseId}/completion")
    public ApiResponse<EnrollmentResponse> completion(@PathVariable UUID courseId){
        return ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.complete(courseId))
                .build();
    }
}
