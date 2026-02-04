package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface QuizQuestionService {
    List<QuizQuestionResponse> findByQuizId(UUID quizId);
    QuizQuestionResponse createQuizQuestion(QuizQuestionRequest quizQuestionRequest);
    void deleteQuizQuestion(UUID quizQuestionId);
    QuizQuestionResponse updateQuizQuestion(UUID quizQuestionId, QuizQuestionUpdateRequest request);
    BigDecimal calculateScore(QuizAnswerRequest request);

}
