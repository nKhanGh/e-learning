package com.khangdev.elearningbe.service.course;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseRejectRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.AdminCourseReviewDetailResponse;
import com.khangdev.elearningbe.dto.response.course.AdminCourseReviewItemResponse;
import com.khangdev.elearningbe.dto.response.course.CoursePublishChecklistResponse;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.course.CourseReviewHistoryResponse;
import com.khangdev.elearningbe.enums.CourseStatus;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    CourseResponse createCourse(CourseCreationRequest request);
    CourseResponse updateCourse(UUID courseId, CourseUpdateRequest request);
    PageResponse<CourseResponse> searchCourse(CourseSearchRequest request, int page, int size) throws JsonProcessingException;
    CourseResponse getCourseById(UUID courseId);
    void deleteCourse(UUID courseId);
    PageResponse<CourseResponse> getCourses(UUID instructorId, int page, int size);
    PageResponse<CourseResponse> getCoursesByInstructorUserId(UUID userId, int page, int size, String keyword, CourseStatus status);
    PageResponse<AdminCourseReviewItemResponse> getAdminCourseReviews(
            int page,
            int size,
            String keyword,
            CourseStatus status,
            UUID categoryId,
            String instructor,
            String sortBy
    );
    AdminCourseReviewDetailResponse getAdminCourseReviewDetail(UUID courseId);
    CourseResponse approveCourseReview(UUID courseId);
    CourseResponse rejectCourseReview(UUID courseId, CourseRejectRequest request);
    CoursePublishChecklistResponse getPublishChecklist(UUID courseId);
    List<CourseReviewHistoryResponse> getReviewHistory(UUID courseId);
    CourseResponse submitForReview(UUID courseId);
}
