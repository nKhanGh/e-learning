package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.entity.course.QuizAttempt;

import java.util.List;

public interface QuizAnswerService {
    QuizAnswerResponse createQuizAnswer(QuizAnswerRequest quizAnswerRequest);
    void saveQuizAnswers(QuizAttempt attempt, List<QuizAnswerRequest> requests);
}
