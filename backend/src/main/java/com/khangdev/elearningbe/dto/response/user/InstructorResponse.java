package com.khangdev.elearningbe.dto.response.user;

import com.khangdev.elearningbe.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorResponse {
    String tagline;
    private String about;
    private String teachingExperience;
    private String credentials;
    private List<String> specializations;
    private String videoIntroUrl;
    private VerificationStatus verificationStatus;
    private List<String> verificationDocuments;
    private Instant verifiedAt;
    private Long verifiedBy;
    private Integer totalStudents = 0;
    private Integer totalCourses = 0;
    private Integer totalReviews = 0;
    private BigDecimal averageRating;
    private BigDecimal totalEarnings;
    private String payoutMethod;
    private List<String> payoutDetails;
    private BigDecimal commissionRate;
    private Boolean featured = false;
}
