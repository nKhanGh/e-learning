package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.LectureProgressResponse;
import com.khangdev.elearningbe.entity.course.LectureProgress;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LectureProgressMapper {
    LectureProgressResponse toResponse(LectureProgress entity);
}
