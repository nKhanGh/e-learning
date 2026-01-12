package com.khangdev.elearningbe.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.entity.course.Course;
import org.mapstruct.MappingTarget;

import java.util.UUID;

public interface CourseService {
    CourseResponse createCourse(CourseCreationRequest request);
    CourseResponse updateCourse(UUID courseId, CourseUpdateRequest request);
    PageResponse<CourseResponse> searchCourse(CourseSearchRequest request, int page, int size) throws JsonProcessingException;
    CourseResponse getCourseById(UUID courseId);
    void deleteCourse(UUID courseId);
    PageResponse<CourseResponse> getCourses(UUID instructorId, int page, int size);
}
