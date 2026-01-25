package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizAnswerMapper;
import com.khangdev.elearningbe.repository.QuizAnswerRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class QuizAnswerServiceTest {

    @Autowired
    private QuizAnswerService quizAnswerService;

    @MockBean
    private QuizAnswerRepository quizAnswerRepository;

    @MockBean
    private QuizQuestionRepository quizQuestionRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private QuizAttemptRepository quizAttemptRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private QuizQuestionService quizQuestionService;

    @MockBean
    private QuizAnswerMapper quizAnswerMapper;

    @Test
    void createQuizAnswer_success() {
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).build();
        Quiz quiz = Quiz.builder().id(quizId).build();
        QuizQuestion question = QuizQuestion.builder().id(questionId).quiz(quiz).build();

        QuizAttemptId attemptId = QuizAttemptId.builder().userId(userId).quizId(quizId).attemptNumber(1).build();
        QuizAttempt attempt = QuizAttempt.builder().id(attemptId).status(AttemptStatus.IN_PROGRESS).build();

        QuizAnswerResponse response = QuizAnswerResponse.builder().score(new BigDecimal("1.00")).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(quizQuestionRepository.findById(questionId)).thenReturn(Optional.of(question));
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(quizAttemptRepository.findMaxAttemptNumber(quizId, userId)).thenReturn(1);
        Mockito.when(quizAttemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        Mockito.when(quizQuestionService.calculateScore(ArgumentMatchers.any(QuizAnswerRequest.class)))
                .thenReturn(new BigDecimal("1.00"));
        Mockito.when(quizAnswerMapper.toResponse(ArgumentMatchers.any(QuizAnswer.class)))
                .thenReturn(response);

        QuizAnswerRequest request = QuizAnswerRequest.builder()
                .questionId(questionId)
                .answers(List.of("A"))
                .build();

        QuizAnswerResponse result = quizAnswerService.createQuizAnswer(request);

        Assertions.assertThat(result.getScore()).isEqualByComparingTo("1.00");
    }

    @Test
    void createQuizAnswer_attemptNotInProgress_throwException() {
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        UUID questionId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).build();
        Quiz quiz = Quiz.builder().id(quizId).build();
        QuizQuestion question = QuizQuestion.builder().id(questionId).quiz(quiz).build();

        QuizAttemptId attemptId = QuizAttemptId.builder().userId(userId).quizId(quizId).attemptNumber(1).build();
        QuizAttempt attempt = QuizAttempt.builder().id(attemptId).status(AttemptStatus.GRADED).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(quizQuestionRepository.findById(questionId)).thenReturn(Optional.of(question));
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(quizAttemptRepository.findMaxAttemptNumber(quizId, userId)).thenReturn(1);
        Mockito.when(quizAttemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));

        QuizAnswerRequest request = QuizAnswerRequest.builder()
                .questionId(questionId)
                .answers(List.of("A"))
                .build();

        Assertions.assertThatThrownBy(() -> quizAnswerService.createQuizAnswer(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.QUIZ_ATTEMPT_INVALID);
    }
}
