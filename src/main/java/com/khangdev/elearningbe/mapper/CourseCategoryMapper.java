package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseCategoryMapper {
    CourseCategory toCategory(CourseCategoryRequest request);
    CourseCategoryResponse toResponse(CourseCategory courseCategory);
}
