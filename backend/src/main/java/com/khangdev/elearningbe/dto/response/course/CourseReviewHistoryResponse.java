package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.enums.CourseReviewAction;
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
public class CourseReviewHistoryResponse {
    private UUID id;
    private UUID courseId;
    private UserResponse reviewer;
    private CourseReviewAction action;
    private CourseStatus fromStatus;
    private CourseStatus toStatus;
    private String reason;
    private Instant createdAt;
}
