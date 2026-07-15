package com.khangdev.elearningbe.dto.response.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptQuestionReviewResponse {
    private UUID questionId;
    private String questionText;
    private BigDecimal points;
    private Integer displayOrder;
    private List<String> options;
    private List<String> selectedAnswers;
    private BigDecimal score;
    private Boolean correct;
    private List<String> correctAnswers;
    private String explanation;
}
