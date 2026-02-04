package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.entity.id.EnrollmentId;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {
    EnrollmentResponse createEnrollment(UUID courseId);
    List<EnrollmentResponse> getEnrollmentsByCourseId(UUID courseId);
    List<EnrollmentResponse> getEnrollmentsByUserId(UUID userId);
    EnrollmentResponse getEnrollmentById(EnrollmentId enrollmentId);
    EnrollmentResponse access(UUID courseId);
    EnrollmentResponse complete(UUID courseId);
}
