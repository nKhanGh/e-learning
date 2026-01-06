package com.khangdev.elearningbe.entity.interaction;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;


@Entity
@Table(name = "certificates", indexes = {
        @Index(name = "idx_enrollment_id", columnList = "enrollment_id"),
        @Index(name = "idx_certificate_number", columnList = "certificate_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "user_id", referencedColumnName = "user_id"),
            @JoinColumn(name = "course_id", referencedColumnName = "course_id")
    })
    private Enrollment enrollment;

    @Column(name = "certificate_number", unique = true, nullable = false)
    private String certificateNumber;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @Column(name = "issued_at")
    private Instant issuedAt = Instant.now();

    @Column(name = "completion_date")
    private Instant completionDate;

    @Column(name = "verification_code", unique = true)
    private String verificationCode;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = true;
}
