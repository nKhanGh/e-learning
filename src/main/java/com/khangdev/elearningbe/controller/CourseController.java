package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.service.CourseService;
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

}
