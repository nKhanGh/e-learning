package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.QuizAnswerRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.entity.course.QuizQuestion;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.QuizQuestionMapper;
import com.khangdev.elearningbe.repository.QuizQuestionRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.service.course.QuizQuestionService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class QuizQuestionServiceTest {

    @Autowired
    private QuizQuestionService quizQuestionService;

    @MockBean
    private QuizQuestionRepository quizQuestionRepository;

    @MockBean
    private QuizRepository quizRepository;

    @MockBean
    private QuizQuestionMapper quizQuestionMapper;

    @MockBean
    private UserService userService;

    @Test
    void calculateScore_success() {
        UUID questionId = UUID.randomUUID();
        QuizQuestion quizQuestion = QuizQuestion.builder()
                .id(questionId)
                .correctAnswers(List.of("A", "B"))
                .build();

        Mockito.when(quizQuestionRepository.findById(questionId)).thenReturn(Optional.of(quizQuestion));

        QuizAnswerRequest request = QuizAnswerRequest.builder()
                .questionId(questionId)
                .answers(List.of("A"))
                .build();

        BigDecimal score = quizQuestionService.calculateScore(request);

        Assertions.assertThat(score).isEqualByComparingTo(new BigDecimal("0.50"));
    }

    @Test
    void findByQuizId_unpublished_unauthorized() {
        UUID quizId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().id(quizId).lecture(lecture).isPublished(false).build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(actorId).build());

        Assertions.assertThatThrownBy(() -> quizQuestionService.findByQuizId(quizId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    void findByQuizId_success() {
        UUID quizId = UUID.randomUUID();
        Quiz quiz = Quiz.builder().id(quizId).isPublished(true).build();
        QuizQuestion question = QuizQuestion.builder().id(UUID.randomUUID()).build();
        QuizQuestionResponse response = QuizQuestionResponse.builder().id(question.getId()).build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId))
                .thenReturn(List.of(question));
        Mockito.when(quizQuestionMapper.toQuizQuestionResponse(question)).thenReturn(response);

        List<QuizQuestionResponse> result = quizQuestionService.findByQuizId(quizId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void createQuizQuestion_success() {
        UUID quizId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder()
                .id(quizId)
                .lecture(lecture)
                .questions(new ArrayList<>())
                .build();
        QuizQuestion question = QuizQuestion.builder().id(UUID.randomUUID()).build();
        quiz.getQuestions().add(question);
        QuizQuestionResponse response = QuizQuestionResponse.builder().id(question.getId()).build();

        QuizQuestionRequest request = QuizQuestionRequest.builder().quizId(quizId).questionText("Q").build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizQuestionMapper.toQuizQuestion(request)).thenReturn(question);
        Mockito.when(quizQuestionRepository.findMaxDisplayOrderByQuizId(quizId)).thenReturn(1);
        Mockito.when(quizQuestionMapper.toQuizQuestionResponse(question)).thenReturn(response);

        QuizQuestionResponse result = quizQuestionService.createQuizQuestion(request);

        Assertions.assertThat(result.getId()).isEqualTo(question.getId());
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void updateQuizQuestion_success() {
        UUID questionId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().lecture(lecture).build();
        QuizQuestion question = QuizQuestion.builder().id(questionId).quiz(quiz).build();
        QuizQuestionResponse response = QuizQuestionResponse.builder().id(questionId).build();

        QuizQuestionUpdateRequest request = QuizQuestionUpdateRequest.builder().questionText("Updated").build();

        Mockito.when(quizQuestionRepository.findById(questionId)).thenReturn(Optional.of(question));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizQuestionMapper.toQuizQuestionResponse(question)).thenReturn(response);

        QuizQuestionResponse result = quizQuestionService.updateQuizQuestion(questionId, request);

        Assertions.assertThat(result.getId()).isEqualTo(questionId);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void deleteQuizQuestion_success() {
        UUID questionId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();

        Quiz quiz = Quiz.builder()
                .lecture(lecture)
                .questions(new ArrayList<>())
                .build();

        QuizQuestion question = QuizQuestion.builder().id(questionId).quiz(quiz).build();


        quiz.getQuestions().add(question);


        Mockito.when(quizQuestionRepository.findById(questionId)).thenReturn(Optional.of(question));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());

        quizQuestionService.deleteQuizQuestion(questionId);

        Assertions.assertThat(quiz.getQuestions()).doesNotContain(question);
    }
}
