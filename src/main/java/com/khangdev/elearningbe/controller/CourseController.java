package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.service.CourseService;
import com.khangdev.elearningbe.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/courses")
public class CourseController {
    CourseService courseService;
    UserService userService;

    @PostMapping
    ApiResponse<CourseResponse> createCourse(@RequestBody CourseCreationRequest request){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.createCourse(request))
                .build();
    }

    @GetMapping("/search")
    ApiResponse<PageResponse<CourseResponse>> searchCourses(
            CourseSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) throws JsonProcessingException {
        return ApiResponse.<PageResponse<CourseResponse>>builder()
                .result(courseService.searchCourse(request, page, size))
                .build();
    }

    @PutMapping("/{courseId}")
    ApiResponse<CourseResponse> updateCourse(@PathVariable UUID courseId, @RequestBody CourseUpdateRequest request){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.updateCourse(courseId, request))
                .build();
    }

    @GetMapping("/{courseId}")
    ApiResponse<CourseResponse> getCourse(@PathVariable UUID courseId){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.getCourseById(courseId))
                .build();
    }

    @DeleteMapping("/{courseId}")
    ApiResponse<Void> deleteCourse(@PathVariable UUID courseId){
        courseService.deleteCourse(courseId);
        return ApiResponse.<Void>builder()
                .message("Course deleted successfully!")
                .build();
    }

    @GetMapping("/my-course")
    ApiResponse<PageResponse<CourseResponse>> getMyCourse(
            @RequestParam(defaultValue = "9", required = false) int page,
            @RequestParam(defaultValue = "0", required = false) int size
    ){
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<PageResponse<CourseResponse>>builder()
                .result(courseService.getCourses(userId, page, size))
                .build();
    }

    @GetMapping("/instructor/{instructorId}")
    ApiResponse<PageResponse<CourseResponse>> getInstructorCourse(
            @PathVariable UUID instructorId,
            @RequestParam(defaultValue = "9", required = false) int page,
            @RequestParam(defaultValue = "0", required = false) int size
    ){
        return ApiResponse.<PageResponse<CourseResponse>>builder()
                .result(courseService.getCourses(instructorId, page, size))
                .build();
    }

}
