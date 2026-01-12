package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface QuizMapper {
    QuizResponse toQuizResponse(Quiz quiz);
    Quiz toQuiz(QuizRequest request);
    void updateQuiz(@MappingTarget Quiz quiz, QuizUpdateRequest request);
}
