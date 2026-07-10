package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentStatusResponse {
    private UUID courseId;
    private Boolean authenticated;
    private Boolean free;
    private Boolean enrolled;
    private Boolean locked;
    private Boolean completed;
    private String courseAccessStatus;
    private EnrollmentStatus enrollmentStatus;
    private BigDecimal progressPercentage;
    private Integer completedLectures;
    private Integer totalLectures;
    private Instant enrolledAt;
    private Instant completedAt;
    private Set<UUID> completedLectureIds;
}

