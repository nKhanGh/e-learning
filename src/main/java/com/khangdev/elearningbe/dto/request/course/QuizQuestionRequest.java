package com.khangdev.elearningbe.dto.request.course;

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
public class QuizQuestionRequest {
    private UUID quizId;
    private String questionText;
    private String explanation;
    private BigDecimal points = BigDecimal.ONE;
    private List<String> options;
    private List<String> correctAnswers;
    private String imageUrl;
    private String videoUrl;
}
