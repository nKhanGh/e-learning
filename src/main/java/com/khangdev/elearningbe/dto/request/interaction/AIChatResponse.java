package com.khangdev.elearningbe.dto.request.interaction;

import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor@AllArgsConstructor
public class AIChatResponse {
    private UUID messageId;
    private String reply;
    private List<CourseRecommendationDTO> suggestedCourses;
}
