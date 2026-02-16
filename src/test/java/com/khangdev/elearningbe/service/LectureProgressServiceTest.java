package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.LectureProgressResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.course.LectureProgress;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.id.LectureProgressId;
import com.khangdev.elearningbe.dto.request.course.NoteRequest;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.LectureProgressMapper;
import com.khangdev.elearningbe.repository.*;
import com.khangdev.elearningbe.service.course.LectureProgressService;
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
public class LectureProgressServiceTest {

    @Autowired
    private LectureProgressService lectureProgressService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private LectureProgressRepository lectureProgressRepository;

    @MockBean
    private LectureRepository lectureRepository;

    @MockBean
    private EnrollmentRepository enrollmentRepository;

    @MockBean
    private LectureProgressMapper lectureProgressMapper;

    @MockBean
    private UserService userService;

    @Test
    void toggleBookmark_success() {
        UUID userId = UUID.randomUUID();
        UUID lectureId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();

        LectureProgress progress = LectureProgress.builder()
                .bookmarked(false)
                .build();
        LectureProgressResponse response = LectureProgressResponse.builder().bookmarked(true).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId))
                .thenReturn(Optional.of(progress));
        Mockito.when(lectureProgressMapper.toResponse(ArgumentMatchers.any(LectureProgress.class)))
                .thenReturn(response);

        LectureProgressResponse result = lectureProgressService.toggleBookmark(lectureId);

        Assertions.assertThat(result.getBookmarked()).isTrue();
    }

    @Test
    void getProgress_unauthorized_throwException() {
        UUID userId = UUID.randomUUID();
        UUID lectureId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(UUID.randomUUID()).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().section(section).build();
        LectureProgress progress = LectureProgress.builder().lecture(lecture).build();

        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(actorId).build());
        Mockito.when(lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId))
                .thenReturn(Optional.of(progress));

        Assertions.assertThatThrownBy(() -> lectureProgressService.getProgress(userId, lectureId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    void createLectureProgress_success() {
        UUID userId = UUID.randomUUID();
        UUID lectureId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).build();
        Lecture lecture = Lecture.builder().id(lectureId).build();
        LectureProgress progress = LectureProgress.builder()
                .id(LectureProgressId.builder().userId(userId).lectureId(lectureId).build())
                .user(user)
                .lecture(lecture)
                .build();
        LectureProgressResponse response = LectureProgressResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(lectureProgressRepository.save(ArgumentMatchers.any(LectureProgress.class))).thenReturn(progress);
        Mockito.when(lectureProgressMapper.toResponse(ArgumentMatchers.any(LectureProgress.class))).thenReturn(response);

        LectureProgressResponse result = lectureProgressService.createLectureProgress(lectureId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void markAsCompleted_success() {
        UUID userId = UUID.randomUUID();
        UUID lectureId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.STUDENT).build();
        Course course = Course.builder().id(courseId).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();
        LectureProgress progress = LectureProgress.builder().lecture(lecture).build();
        Enrollment enrollment = Enrollment.builder()
                .id(EnrollmentId.builder().userId(userId).courseId(courseId).build())
                .user(user)
                .build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId))
                .thenReturn(Optional.of(progress));
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(enrollmentRepository.findById(ArgumentMatchers.any(EnrollmentId.class)))
                .thenReturn(Optional.of(enrollment));
        Mockito.when(lectureRepository.countByCourseId(courseId)).thenReturn(1L);
        Mockito.when(lectureProgressRepository.countCompletedByUserIdAndCourseId(userId, courseId)).thenReturn(1L);
        Mockito.when(lectureProgressMapper.toResponse(progress)).thenReturn(LectureProgressResponse.builder().build());

        LectureProgressResponse result = lectureProgressService.markAsCompleted(lectureId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void getCourseProgress_success() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();
        LectureProgress progress = LectureProgress.builder().build();
        LectureProgressResponse response = LectureProgressResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressRepository.findByUserIdAndCourseId(userId, courseId))
                .thenReturn(java.util.List.of(progress));
        Mockito.when(lectureProgressMapper.toResponse(progress)).thenReturn(response);

        var result = lectureProgressService.getCourseProgress(userId, courseId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void getBookmarkedLectures_success() {
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();
        LectureProgress progress = LectureProgress.builder().bookmarked(true).build();
        LectureProgressResponse response = LectureProgressResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressRepository.findByBookmarkedTrueAndUserId(userId))
                .thenReturn(java.util.List.of(progress));
        Mockito.when(lectureProgressMapper.toResponse(progress)).thenReturn(response);

        var result = lectureProgressService.getBookmarkedLectures();

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void addNotes_success() {
        UUID userId = UUID.randomUUID();
        UUID lectureId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();
        LectureProgress progress = LectureProgress.builder().build();
        LectureProgressResponse response = LectureProgressResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId))
                .thenReturn(Optional.of(progress));
        Mockito.when(lectureProgressMapper.toResponse(progress)).thenReturn(response);

        NoteRequest noteRequest = NoteRequest.builder().note("note").build();

        LectureProgressResponse result = lectureProgressService.addNotes(lectureId, noteRequest);

        Assertions.assertThat(result).isNotNull();
    }
}
