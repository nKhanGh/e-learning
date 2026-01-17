package com.khangdev.elearningbe.dto.request.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizUpdateRequest {
    private String title;
    private String description;
    private String instructions;
    private Integer timeLimitMinutes;
    private BigDecimal passingScore = new BigDecimal("70.00");
    private Integer maxAttempts;
    private Boolean randomizeQuestions = false;
    private Boolean showCorrectAnswers = true;
    private Boolean showAnswersAfterSubmission = true;
    private BigDecimal totalPoints = BigDecimal.ZERO;
    private Boolean isPublished = true;
}
