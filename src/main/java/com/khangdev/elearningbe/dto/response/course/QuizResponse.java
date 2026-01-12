package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.entity.course.Lecture;
import jakarta.persistence.*;
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
public class QuizResponse {
    private UUID id;
    private String title;
    private String description;
    private String instructions;
    private Integer timeLimitMinutes;
    private BigDecimal passingScore;
    private Integer maxAttempts;
    private Boolean randomizeQuestions;
    private Boolean showCorrectAnswers;
    private Boolean showAnswersAfterSubmission;
    private Integer totalQuestions;
    private BigDecimal totalPoints;
    private Boolean isPublished;
    private List<QuizQuestionResponse> questions;
}
