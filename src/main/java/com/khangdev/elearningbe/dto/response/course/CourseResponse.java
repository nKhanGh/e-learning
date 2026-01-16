package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.enums.CourseLevel;
import com.khangdev.elearningbe.enums.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    UUID id;

    private UserResponse instructor;

    private CourseCategoryResponse category;

    private String title;

    private String slug;

    private String description;

    private List<String> whatYouWillLearn;

    private List<String> requirements;

    private List<String> targetAudience;

    private String thumbnailUrl;

    private String promotionalVideoUrl;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private String currency;

    private Boolean isFree;

    private CourseLevel level;

    private String language;

    private Boolean hasCaptions;

    private Integer durationMinutes;

    private CourseStatus status;

    private Instant publishedAt;

    private Instant lastUpdatedContent;

    private Boolean hasCertificate;

    private Boolean hasQuizzes;

    private String metaTitle;

    private String metaDescription;

    private List<String> metaKeywords;

    private Integer totalEnrollments;

    private Integer totalStudents;

    private Integer totalReviews;

    private BigDecimal averageRating;

    private Integer totalLectures;

    private Integer totalSections;

    private Integer totalVideoLengthMinutes;

    private Boolean isFeatured;

    private Boolean isBestseller;

    private Boolean isNew;

    private List<CourseTagResponse> tags;
}
