package com.khangdev.elearningbe.service.ai;

import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;

import java.util.List;
import java.util.UUID;

public interface CourseRecommendationService {
    List<CourseRecommendationDTO> recommendByUserPreferences(
            UUID userId,
            String preferences
    );

    List<CourseRecommendationDTO> recommendSimilarCourses(UUID courseId);
    List<CourseRecommendationDTO> recommendForBeginners(String topic);
    CourseRecommendationDTO getCourseRecommendation(UUID courseId, Double score);
}
