package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.response.course.CourseCurriculumResponse;
import com.khangdev.elearningbe.dto.response.course.CourseEnrollmentStatusResponse;

import java.util.UUID;

public interface CourseLearningService {
    CourseCurriculumResponse getCurriculum(UUID courseId);
    CourseEnrollmentStatusResponse getEnrollmentStatus(UUID courseId);
}

