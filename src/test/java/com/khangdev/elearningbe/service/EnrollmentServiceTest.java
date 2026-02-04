package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.EnrollmentMapper;
import com.khangdev.elearningbe.repository.*;
import com.khangdev.elearningbe.service.course.EnrollmentService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class EnrollmentServiceTest {

    @Autowired
    private EnrollmentService enrollmentService;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private LectureRepository lectureRepository;

    @MockBean
    private LectureProgressRepository lectureProgressRepository;

    @MockBean
    private EnrollmentMapper enrollmentMapper;

    @MockBean
    private UserService userService;

    @Test
    void getEnrollmentById_success() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        EnrollmentId enrollmentId = EnrollmentId.builder().userId(userId).courseId(courseId).build();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.STUDENT).build();
        Instructor instructor = Instructor.builder().id(UUID.randomUUID()).build();
        Course course = Course.builder().id(courseId).instructor(instructor).build();
        Enrollment enrollment = Enrollment.builder().id(enrollmentId).user(user).course(course).build();
        EnrollmentResponse response = EnrollmentResponse.builder().id(enrollmentId).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(enrollmentRepository.findById(enrollmentId)).thenReturn(Optional.of(enrollment));
        Mockito.when(enrollmentMapper.toResponse(enrollment)).thenReturn(response);

        EnrollmentResponse result = enrollmentService.getEnrollmentById(enrollmentId);

        Assertions.assertThat(result.getId()).isEqualTo(enrollmentId);
    }

    @Test
    void createEnrollment_userNotStudent_throwException() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.INSTRUCTOR).build();
        Course course = Course.builder().id(courseId).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));

        Assertions.assertThatThrownBy(() -> enrollmentService.createEnrollment(courseId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    void createEnrollment_success() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.STUDENT).build();
        Course course = Course.builder().id(courseId).price(java.math.BigDecimal.TEN).build();
        Enrollment enrollment = Enrollment.builder()
                .id(EnrollmentId.builder().userId(userId).courseId(courseId).build()).build();
        EnrollmentResponse response = EnrollmentResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        Mockito.when(enrollmentRepository.existsById(ArgumentMatchers.any(EnrollmentId.class))).thenReturn(false);
        Mockito.when(enrollmentRepository.save(ArgumentMatchers.any(Enrollment.class))).thenReturn(enrollment);
        Mockito.when(enrollmentMapper.toResponse(ArgumentMatchers.any(Enrollment.class))).thenReturn(response);

        EnrollmentResponse result = enrollmentService.createEnrollment(courseId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void getEnrollmentsByCourseId_success() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        Instructor instructor = Instructor.builder().id(userId).build();
        Course course = Course.builder().id(courseId).instructor(instructor).build();
        Enrollment enrollment = Enrollment.builder()
                .id(EnrollmentId.builder().userId(userId).courseId(courseId).build()).build();
        EnrollmentResponse response = EnrollmentResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId))
                .thenReturn(Optional.of(User.builder().id(userId).role(UserRole.INSTRUCTOR).build()));
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        Mockito.when(enrollmentRepository.findByCourseId(courseId)).thenReturn(java.util.List.of(enrollment));
        Mockito.when(enrollmentMapper.toResponse(enrollment)).thenReturn(response);

        var result = enrollmentService.getEnrollmentsByCourseId(courseId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void getEnrollmentsByUserId_self_success() {
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();
        Enrollment enrollment = Enrollment.builder()
                .id(EnrollmentId.builder().userId(userId).courseId(UUID.randomUUID()).build()).build();
        EnrollmentResponse response = EnrollmentResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(enrollmentRepository.findByUserId(userId)).thenReturn(java.util.List.of(enrollment));
        Mockito.when(enrollmentMapper.toResponse(enrollment)).thenReturn(response);

        var result = enrollmentService.getEnrollmentsByUserId(userId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void access_success() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        EnrollmentId id = EnrollmentId.builder().userId(userId).courseId(courseId).build();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.STUDENT).build();
        Enrollment enrollment = Enrollment.builder().id(id).user(user)
                .status(com.khangdev.elearningbe.enums.EnrollmentStatus.ACTIVE).build();
        EnrollmentResponse response = EnrollmentResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(enrollmentRepository.findById(id)).thenReturn(Optional.of(enrollment));
        Mockito.when(enrollmentMapper.toResponse(enrollment)).thenReturn(response);

        EnrollmentResponse result = enrollmentService.access(courseId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void complete_notFullyCompleted_throwException() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        EnrollmentId id = EnrollmentId.builder().userId(userId).courseId(courseId).build();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.STUDENT).build();
        Enrollment enrollment = Enrollment.builder().id(id).user(user).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(enrollmentRepository.findById(id)).thenReturn(Optional.of(enrollment));
        Mockito.when(lectureRepository.countByCourseId(courseId)).thenReturn(2L);
        Mockito.when(lectureProgressRepository.countCompletedByUserIdAndCourseId(userId, courseId)).thenReturn(1L);

        Assertions.assertThatThrownBy(() -> enrollmentService.complete(courseId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.COURSE_NOT_FULLY_COMPLETED);
    }
}
