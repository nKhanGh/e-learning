package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.InstructorResponse;
import com.khangdev.elearningbe.entity.user.Instructor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InstructorMapper {
    InstructorResponse toResponse(Instructor instructor);
}
