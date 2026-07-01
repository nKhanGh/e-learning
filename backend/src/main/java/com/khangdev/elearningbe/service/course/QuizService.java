package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;

import java.util.UUID;

public interface QuizService {
    QuizResponse createQuiz(QuizRequest quizRequest);
    QuizResponse updateQuiz(UUID quizId, QuizUpdateRequest request);
    QuizResponse getByLectureId(UUID lectureId);
    QuizResponse getPublicQuizByLectureId(UUID lectureId);
    QuizResponse getPublicQuizByQuizId(UUID quizId);
    QuizResponse getByQuizId(UUID quizId);
    void deleteById(UUID quizId);
}
