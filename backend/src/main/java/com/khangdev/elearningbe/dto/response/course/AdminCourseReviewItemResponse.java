package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.enums.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseReviewItemResponse {
    private UUID id;
    private String title;
    private UserResponse instructor;
    private CourseCategoryResponse category;
    private CourseStatus status;
    private Integer totalSections;
    private Integer totalLectures;
    private Integer totalQuizzes;
    private Boolean checklistReady;
    private Integer checklistPassed;
    private Integer checklistTotal;
    private Instant submittedAt;
    private Instant updatedAt;
}
