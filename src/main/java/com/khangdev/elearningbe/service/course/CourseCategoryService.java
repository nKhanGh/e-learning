package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;

public interface CourseCategoryService {
    CourseCategoryResponse createCourseCategory(CourseCategoryRequest request);
}
