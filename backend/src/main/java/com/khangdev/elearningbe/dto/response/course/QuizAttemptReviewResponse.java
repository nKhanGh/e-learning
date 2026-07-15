package com.khangdev.elearningbe.dto.response.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptReviewResponse {
    private QuizAttemptResponse attempt;
    private Boolean showCorrectAnswers;
    private List<QuizAttemptQuestionReviewResponse> questions;
}
