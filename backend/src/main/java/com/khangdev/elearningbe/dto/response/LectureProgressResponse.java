package com.khangdev.elearningbe.dto.response;


import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.LectureProgressId;
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
public class LectureProgressResponse {
    private LectureProgressId id;
    private UserResponse user;
    private LectureResponse lecture;
    private BigDecimal progressPercentage = BigDecimal.ZERO;
    private Integer lastWatchedPositionSeconds;
    private Integer totalWatchTimeSeconds;
    private Boolean completed;
    private Instant completedAt;
    private Instant firstWatchedAt;
    private Instant lastWatchedAt;
    private Integer viewCount;
    private Boolean bookmarked;
    private String notes;
}
