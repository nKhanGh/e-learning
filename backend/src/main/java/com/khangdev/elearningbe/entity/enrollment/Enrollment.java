package com.khangdev.elearningbe.entity.enrollment;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"}),
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_course_id", columnList = "course_id"),
                @Index(name = "idx_status", columnList = "status"),
                @Index(name = "idx_enrolled_at", columnList = "enrolled_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment extends BaseEntity {

    @EmbeddedId
    private EnrollmentId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @MapsId("courseId")
    private Course course;

    @Column(name = "enrolled_at")
    private Instant enrolledAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "progress_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal progressPercentage = BigDecimal.ZERO;

    @Column(name = "completed_lectures")
    @Builder.Default
    private Integer completedLectures = 0;

    @Column(name = "total_watch_time_minutes")
    @Builder.Default
    private Integer totalWatchTimeMinutes = 0;

    @Column(name = "last_accessed_at")
    private Instant lastAccessedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "certificate_issued")
    @Builder.Default
    private Boolean certificateIssued = false;

    @Column(name = "certificate_issued_at")
    private Instant certificateIssuedAt;

    @Column(name = "payment_amount", precision = 10, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "refund_requested")
    @Builder.Default
    private Boolean refundRequested = false;

    @Column(name = "refund_requested_at")
    private Instant refundRequestedAt;

    @Column(name = "refunded")
    @Builder.Default
    private Boolean refunded = false;

    @Column(name = "refunded_at")
    private Instant refundedAt;
}
