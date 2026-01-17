package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;
import com.khangdev.elearningbe.service.CourseTagService;
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
@RequestMapping("/course-tags")
public class CourseTagController {
    CourseTagService courseTagService;

    @PostMapping
    ApiResponse<CourseTagResponse> create(@RequestBody CourseTagRequest request) {
        return ApiResponse.<CourseTagResponse>builder()
                .result(courseTagService.createCourseTag(request))
                .build();
    }

    @PostMapping("/list")
    ApiResponse<List<CourseTagResponse>> list(@RequestBody List<CourseTagRequest> request) {
        return ApiResponse.<List<CourseTagResponse>>builder()
                .result(request.stream().map(courseTagService::createCourseTag).toList())
                .build();
    }
}
