package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.enums.CourseLevel;
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
    private String category;
    private String thumbnailUrl;
    private BigDecimal originalPrice;
    private CourseLevel level;
    private Double similarityScore;
    private String reason;
}
