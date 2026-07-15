package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuizAttemptMapper {
    @Mapping(target = "attemptNumber", source = "id.attemptNumber")
    @Mapping(target = "startedAt", source = "createdAt")
    QuizAttemptResponse toResponse(QuizAttempt quizAttempt);
}
