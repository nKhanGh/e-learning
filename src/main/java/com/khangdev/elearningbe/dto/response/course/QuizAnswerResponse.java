package com.khangdev.elearningbe.dto.response.course;


import com.khangdev.elearningbe.converter.StringListJsonConverter;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import com.khangdev.elearningbe.entity.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerResponse {
    QuizAnswerId id;

    private UserResponse user;

    private QuizQuestionResponse question;

    private List<String> answer;

    private BigDecimal score;
}
