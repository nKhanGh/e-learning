package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface QuizQuestionMapper {
    QuizQuestion toQuizQuestion(QuizQuestionRequest request);
    QuizQuestionResponse toQuizQuestionResponse(QuizQuestion quizQuestion);
    void updateQuizQuestion(@MappingTarget QuizQuestion quizQuestion, QuizQuestionUpdateRequest request);
}
