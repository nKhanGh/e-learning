package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;
import com.khangdev.elearningbe.service.course.CourseSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("course-sections")
public class CourseSectionController {
    private final CourseSectionService courseSectionService;

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<CourseSectionResponse>> getCourseSectionByCourseId(@PathVariable("courseId") UUID courseId) {
        return ApiResponse.<List<CourseSectionResponse>>builder()
                .result(courseSectionService.getCourseSectionByCourse(courseId))
                .build();
    }

    @PostMapping
    public ApiResponse<CourseSectionResponse> addCourseSection(@RequestBody CourseSectionRequest request) {
        return ApiResponse.<CourseSectionResponse>builder()
                .result(courseSectionService.createCourseSection(request))
                .build();
    }

    @GetMapping("/{courseSectionId}")
    public ApiResponse<CourseSectionResponse> getCourseSectionById(@PathVariable UUID courseSectionId) {
        return ApiResponse.<CourseSectionResponse>builder()
                .result(courseSectionService.getCourseSectionById(courseSectionId))
                .build();
    }

    @PutMapping("/{courseSectionId}")
    public ApiResponse<CourseSectionResponse> updateCourseSection(
            @PathVariable UUID courseSectionId,
            @RequestBody CourseSectionRequest request
    ) {
        return ApiResponse.<CourseSectionResponse>builder()
                .result(courseSectionService.updateCourseSection(courseSectionId, request))
                .build();
    }

    @DeleteMapping("/{courseSectionId}")
    public ApiResponse<Void> deleteCourseSection(@PathVariable UUID courseSectionId) {
        courseSectionService.deleteCourseSection(courseSectionId);
        return ApiResponse.<Void>builder()
                .message("Course section deleted successfully!")
                .build();
    }
}
