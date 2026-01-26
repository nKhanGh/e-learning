package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAnswerResponse;
import com.khangdev.elearningbe.enums.AttemptStatus;
import com.khangdev.elearningbe.mapper.QuizAttemptMapper;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.QuizAttemptRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class QuizAttemptServiceTest {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @MockBean
    private QuizAttemptRepository quizAttemptRepository;

    @MockBean
    private QuizRepository quizRepository;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private QuizAnswerService quizAnswerService;

    @MockBean
    private QuizAttemptMapper quizAttemptMapper;

    @Test
    void getAllAttempts_success() {
        UUID userId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        QuizAttempt attempt = QuizAttempt.builder().build();
        QuizAttemptResponse response = QuizAttemptResponse.builder().build();

        Mockito.when(quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId))
                .thenReturn(List.of(attempt));
        Mockito.when(quizAttemptMapper.toResponse(attempt)).thenReturn(response);

        List<QuizAttemptResponse> result = quizAttemptService.getAllAttempts(userId, quizId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void getAttempt_unauthorized_throwException() {
        UUID userId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        UUID quizId = UUID.randomUUID();
        Integer attemptNumber = 1;

        Instructor instructor = Instructor.builder().id(UUID.randomUUID()).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().lecture(lecture).build();
        QuizAttempt attempt = QuizAttempt.builder().quiz(quiz).build();

        Mockito.when(quizAttemptRepository.findById(ArgumentMatchers.any()))
                .thenReturn(java.util.Optional.of(attempt));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(actorId).build());

        Assertions.assertThatThrownBy(() -> quizAttemptService.getAttempt(userId, quizId, attemptNumber))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    void attemptQuiz_success() {
        UUID quizId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Quiz quiz = Quiz.builder().id(quizId)
                .lecture(Lecture.builder()
                        .section(CourseSection.builder().course(Course.builder().id(UUID.randomUUID()).build()).build())
                        .build())
                .build();
        User user = User.builder().id(userId).build();
        QuizAttempt attempt = QuizAttempt.builder()
                .id(QuizAttemptId.builder().quizId(quizId).userId(userId).attemptNumber(1).build()).quiz(quiz)
                .user(user).build();
        QuizAttemptResponse response = QuizAttemptResponse.builder().build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(userId).build());
        Mockito.when(enrollmentRepository.existsByUserIdAndCourseId(userId,
                quiz.getLecture().getSection().getCourse().getId()))
                .thenReturn(false);
        Mockito.when(quizAttemptRepository.findAllByUserIdAndQuizId(userId, quizId)).thenReturn(List.of());
        Mockito.when(quizAttemptRepository.findMaxAttemptNumber(quizId, userId)).thenReturn(null);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(quizAttemptRepository.save(ArgumentMatchers.any(QuizAttempt.class))).thenReturn(attempt);
        Mockito.when(quizAttemptMapper.toResponse(ArgumentMatchers.any(QuizAttempt.class))).thenReturn(response);

        QuizAttemptResponse result = quizAttemptService.attemptQuiz(quizId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void submitQuiz_success() {
        UUID quizId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Quiz quiz = Quiz.builder().id(quizId).totalPoints(new java.math.BigDecimal("10.00"))
                .lecture(Lecture.builder()
                        .section(CourseSection.builder().course(Course.builder().id(UUID.randomUUID()).build()).build())
                        .build())
                .build();
        User user = User.builder().id(userId).build();
        QuizAttemptId attemptId = QuizAttemptId.builder().quizId(quizId).userId(userId).attemptNumber(1).build();
        QuizAttempt attempt = QuizAttempt.builder().id(attemptId).quiz(quiz).user(user)
                .status(AttemptStatus.IN_PROGRESS).build();
        attempt.setCreatedAt(java.time.Instant.now().minusSeconds(60));
        QuizAttemptResponse response = QuizAttemptResponse.builder().build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(userId).build());
        Mockito.when(enrollmentRepository.existsByUserIdAndCourseId(userId,
                quiz.getLecture().getSection().getCourse().getId()))
                .thenReturn(false);
        Mockito.when(quizAttemptRepository.findMaxAttemptNumber(quizId, userId)).thenReturn(1);
        Mockito.when(quizAttemptRepository.findById(attemptId)).thenReturn(Optional.of(attempt));
        Mockito.when(quizAnswerService.createQuizAnswer(ArgumentMatchers.any()))
                .thenReturn(QuizAnswerResponse.builder().score(new java.math.BigDecimal("5.00")).build());
        Mockito.when(quizAttemptMapper.toResponse(attempt)).thenReturn(response);

        QuizSubmitRequest request = QuizSubmitRequest.builder().answers(List.of()).build();

        QuizAttemptResponse result = quizAttemptService.submitQuiz(quizId, request);

        Assertions.assertThat(result).isNotNull();
    }
}
