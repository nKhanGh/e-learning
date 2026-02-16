package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;
import com.khangdev.elearningbe.service.course.CourseCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/course-categories")
public class CourseCategoryController {
    CourseCategoryService courseCategoryService;

    @PostMapping
    ApiResponse<CourseCategoryResponse> create(@RequestBody CourseCategoryRequest request) {
        return ApiResponse.<CourseCategoryResponse>builder()
                .result(courseCategoryService.createCourseCategory(request))
                .build();
    }

    @PostMapping("/list")
    ApiResponse<List<CourseCategoryResponse>> update(@RequestBody List<CourseCategoryRequest> request) {
        return ApiResponse.<List<CourseCategoryResponse>>builder()
                .result(request.stream().map(courseCategoryService::createCourseCategory).toList())
                .build();
    }
}
