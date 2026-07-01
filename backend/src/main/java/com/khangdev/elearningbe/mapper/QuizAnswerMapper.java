package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.entity.course.QuizAnswer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuizAnswerMapper {
    QuizAnswerResponse toResponse(QuizAnswer quizAnswer);
}
