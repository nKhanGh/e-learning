package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptService {

    QuizAttemptResponse attemptQuiz(UUID quizId);
    QuizAttemptResponse submitQuiz(UUID quizId, QuizSubmitRequest request);
    QuizAttemptResponse getAttempt(UUID userId, UUID quizId, Integer attemptNumber);
    List<QuizAttemptResponse> getAllAttempts(UUID userId, UUID quizId);
}
