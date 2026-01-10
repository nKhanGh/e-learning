package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.entity.course.CourseTag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseTagMapper {
    CourseTag toCourseTag(CourseTagRequest request);
    CourseTagResponse toCourseTagResponse(CourseTag courseTag);
}
