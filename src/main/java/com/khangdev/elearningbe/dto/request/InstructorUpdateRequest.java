package com.khangdev.elearningbe.dto.request;

import com.khangdev.elearningbe.converter.StringListJsonConverter;
import com.khangdev.elearningbe.enums.VerificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
public class InstructorUpdateRequest {
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
