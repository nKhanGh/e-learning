package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    EnrollmentResponse toResponse(Enrollment enrollment);
}
