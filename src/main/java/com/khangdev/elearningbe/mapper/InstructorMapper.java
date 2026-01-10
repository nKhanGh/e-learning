package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.InstructorUpdateRequest;
import com.khangdev.elearningbe.dto.response.InstructorResponse;
import com.khangdev.elearningbe.entity.user.Instructor;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface InstructorMapper {
    InstructorResponse toResponse(Instructor instructor);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateInstructor(@MappingTarget Instructor instructor, InstructorUpdateRequest request);
}
