package com.khangdev.elearningbe.dto.response;

import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private EnrollmentId id;
    private UserResponse user;
    private CourseResponse course;
    private Instant enrolledAt = Instant.now();
    private EnrollmentStatus status;
    private BigDecimal progressPercentage = BigDecimal.ZERO;
    private Integer completedLectures = 0;
    private Integer totalWatchTimeMinutes = 0;
    private Instant lastAccessedAt;
    private Instant completedAt;
    private Boolean certificateIssued = false;
    private Instant certificateIssuedAt;
    private BigDecimal paymentAmount;
    private Boolean refundRequested = false;
    private Instant refundRequestedAt;
    private Boolean refunded = false;
    private Instant refundedAt;
}
