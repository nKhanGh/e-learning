package com.khangdev.elearningbe.entity.user;


import com.khangdev.elearningbe.converter.StringListJsonConverter;
import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "instructors", indexes =  {
        @Index(name = "idx_verification_status", columnList = "verification_status"),
        @Index(name = "idx_featured", columnList = "featured")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Instructor extends BaseEntity {

    @Id
    @Column(name = "user_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    String tagline;

    @Column(columnDefinition = "TEXT")
    private String about;

    @Column(name = "teaching_experience", columnDefinition = "TEXT")
    private String teachingExperience;

    @Column(columnDefinition = "TEXT")
    private String credentials;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "specializations", columnDefinition = "JSON")
    private List<String> specializations; // JSON array

    @Column(name = "video_intro_url", length = 500)
    private String videoIntroUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;


    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "verification_documents", columnDefinition = "JSON")
    private List<String> verificationDocuments;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private Long verifiedBy;

    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;

    @Column(name = "total_courses")
    @Builder.Default
    private Integer totalCourses = 0;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_earnings", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalEarnings = BigDecimal.ZERO;

    @Column(name = "payout_method", length = 50)
    private String payoutMethod;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "payout_details", columnDefinition = "JSON")
    private List<String> payoutDetails;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionRate = new BigDecimal("30.00");

    @Builder.Default
    private Boolean featured = false;
}
