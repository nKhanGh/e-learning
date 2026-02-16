package com.khangdev.elearningbe.dto.request.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRecommendationDTO {
    private UUID courseId;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private BigDecimal price;
    private String level;
    private BigDecimal averageRating;
    private Integer totalStudents;
    private Double similarityScore;
    private String reason;
}
