package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.response.course.AdminCourseReviewItemResponse;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.service.course.CourseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/admin/course-reviews")
public class AdminCourseReviewController {
    CourseService courseService;

    @GetMapping
    ApiResponse<PageResponse<AdminCourseReviewItemResponse>> getCourseReviews(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "PENDING_REVIEW", required = false) CourseStatus status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String instructor,
            @RequestParam(defaultValue = "SUBMITTED_DESC", required = false) String sortBy
    ) {
        return ApiResponse.<PageResponse<AdminCourseReviewItemResponse>>builder()
                .result(courseService.getAdminCourseReviews(
                        page,
                        size,
                        keyword,
                        status,
                        categoryId,
                        instructor,
                        sortBy
                ))
                .build();
    }
}
