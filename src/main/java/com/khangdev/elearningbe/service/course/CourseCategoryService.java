package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;

import java.util.List;

public interface CourseCategoryService {
    CourseCategoryResponse createCourseCategory(CourseCategoryRequest request);
    List<CourseCategoryResponse> getCourseCategories();
}
