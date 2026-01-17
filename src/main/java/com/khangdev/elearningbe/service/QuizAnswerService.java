package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;

public interface QuizAnswerService {
    QuizAnswerResponse createQuizAnswer(QuizAnswerRequest quizAnswerRequest);
}
