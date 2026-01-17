package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;
import com.khangdev.elearningbe.entity.course.CourseSection;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CourseSectionMapper {
    CourseSectionResponse toResponse(CourseSection courseSection);
    CourseSection toEntity(CourseSectionRequest courseSectionRequest);
    void updateEntity(@MappingTarget CourseSection courseSection, CourseSectionRequest request);
}
