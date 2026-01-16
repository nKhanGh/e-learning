package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.enums.AttemptStatus;
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
public class QuizAttemptResponse {
    private QuizAttemptId id;

    private Integer attemptNumber;

    private QuizResponse quiz;

    private UserResponse user;

    private Instant submittedAt;

    private Integer timeTakenSeconds;

    private BigDecimal score;

    private BigDecimal percentage;

    private Boolean passed;

    private AttemptStatus status;
}
