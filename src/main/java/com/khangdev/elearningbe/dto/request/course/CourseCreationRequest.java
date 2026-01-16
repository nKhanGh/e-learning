package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.enums.CourseLevel;
import com.khangdev.elearningbe.enums.CourseStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseCreationRequest {
    private UUID categoryId;

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

    private String currency = "USD";

    private Boolean isFree;

    private CourseLevel level;

    private String language = "en";

    private Boolean hasCaptions;

    private Integer durationMinutes = 0;

    private CourseStatus status = CourseStatus.DRAFT;

    private Instant lastUpdatedContent;

    private Boolean hasCertificate = true;

    private Boolean hasQuizzes = false;

    private String metaTitle;

    private String metaDescription;

    private List<String> metaKeywords;

    private List<String> tagNames;
}
