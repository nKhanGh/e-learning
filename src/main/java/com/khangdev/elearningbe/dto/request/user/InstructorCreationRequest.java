package com.khangdev.elearningbe.dto.request.user;

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
public class InstructorCreationRequest {
    String tagline;
    private String about;
    private String teachingExperience;
    private String credentials;
    private List<String> specializations;
    private String videoIntroUrl;
    private List<String> verificationDocuments;
    private Instant verifiedAt;
    private Long verifiedBy;
    private String payoutMethod;
    private List<String> payoutDetails;
    private BigDecimal commissionRate = new BigDecimal("30.00");
    private Boolean featured = false;
}
