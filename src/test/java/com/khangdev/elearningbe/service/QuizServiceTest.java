package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.mapper.QuizMapper;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class QuizServiceTest {

    @Autowired
    private QuizService quizService;

    @MockBean
    private QuizRepository quizRepository;

    @MockBean
    private QuizMapper quizMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private LectureRepository lectureRepository;

    @Test
    void getPublicQuizByQuizId_success() {
        UUID quizId = UUID.randomUUID();
        Quiz quiz = Quiz.builder().id(quizId).isPublished(true).build();
        QuizResponse response = QuizResponse.builder().id(quizId).title("Quiz").build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.getPublicQuizByQuizId(quizId);

        Assertions.assertThat(result.getId()).isEqualTo(quizId);
    }

    @Test
    void getPublicQuizByQuizId_unpublished_unauthorized() {
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

        Assertions.assertThatThrownBy(() -> quizService.getPublicQuizByQuizId(quizId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void createQuiz_success() {
        UUID lectureId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();
        Quiz quiz = Quiz.builder().id(UUID.randomUUID()).build();
        QuizResponse response = QuizResponse.builder().id(quiz.getId()).build();

        QuizRequest request = QuizRequest.builder().lectureId(lectureId).title("Quiz").build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizMapper.toQuiz(request)).thenReturn(quiz);
        Mockito.when(quizRepository.save(quiz)).thenReturn(quiz);
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.createQuiz(request);

        Assertions.assertThat(result.getId()).isEqualTo(quiz.getId());
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void updateQuiz_success() {
        UUID quizId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().id(quizId).lecture(lecture).build();
        QuizResponse response = QuizResponse.builder().id(quizId).build();

        QuizUpdateRequest request = QuizUpdateRequest.builder().title("Updated").build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.updateQuiz(quizId, request);

        Assertions.assertThat(result.getId()).isEqualTo(quizId);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void getByLectureId_success() {
        UUID lectureId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().id(UUID.randomUUID()).lecture(lecture).build();
        QuizResponse response = QuizResponse.builder().id(quiz.getId()).build();

        Mockito.when(quizRepository.findByLectureId(lectureId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.getByLectureId(lectureId);

        Assertions.assertThat(result.getId()).isEqualTo(quiz.getId());
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void getByQuizId_success() {
        UUID quizId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().id(quizId).lecture(lecture).build();
        QuizResponse response = QuizResponse.builder().id(quizId).build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.getByQuizId(quizId);

        Assertions.assertThat(result.getId()).isEqualTo(quizId);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void deleteById_success() {
        UUID quizId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        Quiz quiz = Quiz.builder().id(quizId).lecture(lecture).build();

        Mockito.when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());

        quizService.deleteById(quizId);

        Mockito.verify(quizRepository).delete(quiz);
    }

    @Test
    void getPublicQuizByLectureId_success() {
        UUID lectureId = UUID.randomUUID();
        Quiz quiz = Quiz.builder().id(UUID.randomUUID()).isPublished(true).build();
        QuizResponse response = QuizResponse.builder().id(quiz.getId()).build();

        Mockito.when(quizRepository.findByLectureId(lectureId)).thenReturn(Optional.of(quiz));
        Mockito.when(quizMapper.toQuizResponse(quiz)).thenReturn(response);

        QuizResponse result = quizService.getPublicQuizByLectureId(lectureId);

        Assertions.assertThat(result.getId()).isEqualTo(quiz.getId());
    }
}
