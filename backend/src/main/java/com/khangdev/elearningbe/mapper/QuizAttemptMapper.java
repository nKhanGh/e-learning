package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuizAttemptMapper {
    QuizAttemptResponse toResponse(QuizAttempt quizAttempt);
}
