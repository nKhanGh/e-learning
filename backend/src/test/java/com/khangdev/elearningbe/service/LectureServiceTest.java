package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.course.PublicLectureResponse;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.mapper.LectureMapper;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.service.course.LectureService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class LectureServiceTest {

    @Autowired
    private LectureService lectureService;

    @MockBean
    private LectureRepository lectureRepository;

    @MockBean
    private CourseSectionRepository courseSectionRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private LectureMapper lectureMapper;

    @Test
    void getGeneralLecturesBySectionId_success() {
        UUID sectionId = UUID.randomUUID();
        Lecture lecture = Lecture.builder().id(UUID.randomUUID()).title("Lecture").build();
        PublicLectureResponse response = PublicLectureResponse.builder().id(lecture.getId()).title("Lecture").build();

        Mockito.when(lectureRepository.findBySectionIdAndIsPublishedTrue(sectionId))
                .thenReturn(List.of(lecture));
        Mockito.when(lectureMapper.toPublicLectureResponse(lecture)).thenReturn(response);

        List<PublicLectureResponse> result = lectureService.getGeneralLecturesBySectionId(sectionId);

        Assertions.assertThat(result).hasSize(1);
        Assertions.assertThat(result.get(0).getTitle()).isEqualTo("Lecture");
    }

    @Test
    void getPublicLectureByLectureId_unpublished_unauthorized() {
        UUID lectureId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).isPublished(false).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(otherUserId).build());

        Assertions.assertThatThrownBy(() -> lectureService.getPublicLectureByLectureId(lectureId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void getLecturesBySectionId_success() {
        UUID sectionId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().id(sectionId).course(course).build();
        Lecture lecture = Lecture.builder().id(UUID.randomUUID()).section(section).build();
        LectureResponse response = LectureResponse.builder().id(lecture.getId()).build();

        Mockito.when(courseSectionRepository.findById(sectionId)).thenReturn(Optional.of(section));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(lectureRepository.findBySectionId(sectionId)).thenReturn(List.of(lecture));
        Mockito.when(lectureMapper.toLectureResponse(lecture)).thenReturn(response);

        var result = lectureService.getLecturesBySectionId(sectionId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void getPublicLecturesBySectionId_success() {
        UUID sectionId = UUID.randomUUID();
        Lecture lecture = Lecture.builder().id(UUID.randomUUID()).build();
        LectureResponse response = LectureResponse.builder().id(lecture.getId()).build();

        Mockito.when(lectureRepository.findBySectionIdAndIsPublishedTrue(sectionId)).thenReturn(List.of(lecture));
        Mockito.when(lectureMapper.toLectureResponse(lecture)).thenReturn(response);

        var result = lectureService.getPublicLecturesBySectionId(sectionId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void getByLectureId_success() {
        UUID lectureId = UUID.randomUUID();
        Lecture lecture = Lecture.builder().id(lectureId).build();
        LectureResponse response = LectureResponse.builder().id(lectureId).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(lectureMapper.toLectureResponse(lecture)).thenReturn(response);

        LectureResponse result = lectureService.getByLectureId(lectureId);

        Assertions.assertThat(result.getId()).isEqualTo(lectureId);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void createLecture_success() {
        UUID sectionId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().id(sectionId).course(course).build();
        Lecture lecture = Lecture.builder().id(UUID.randomUUID()).section(section).build();
        LectureResponse response = LectureResponse.builder().id(lecture.getId()).build();

        LectureRequest request = LectureRequest.builder().sectionId(sectionId).title("Lecture").build();

        Mockito.when(courseSectionRepository.findById(sectionId)).thenReturn(Optional.of(section));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(lectureMapper.toLecture(request)).thenReturn(lecture);
        Mockito.when(lectureRepository.findMaxDisplayOrderBySectionId(sectionId)).thenReturn(1);
        Mockito.when(lectureRepository.save(lecture)).thenReturn(lecture);
        Mockito.when(lectureMapper.toLectureResponse(lecture)).thenReturn(response);

        LectureResponse result = lectureService.createLecture(request);

        Assertions.assertThat(result.getId()).isEqualTo(lecture.getId());
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void updateLecture_success() {
        UUID lectureId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();
        LectureResponse response = LectureResponse.builder().id(lectureId).build();

        LectureUpdateRequest request = LectureUpdateRequest.builder().title("Updated").build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());
        Mockito.when(lectureRepository.save(lecture)).thenReturn(lecture);
        Mockito.when(lectureMapper.toLectureResponse(lecture)).thenReturn(response);

        LectureResponse result = lectureService.updateLecture(lectureId, request);

        Assertions.assertThat(result.getId()).isEqualTo(lectureId);
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void deleteByLectureId_success() {
        UUID lectureId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        Course course = Course.builder().instructor(instructor).build();
        CourseSection section = CourseSection.builder().course(course).build();
        Lecture lecture = Lecture.builder().id(lectureId).section(section).build();

        Mockito.when(lectureRepository.findById(lectureId)).thenReturn(Optional.of(lecture));
        Mockito.when(userService.getMyInfo()).thenReturn(UserResponse.builder().id(instructorId).build());

        lectureService.deleteByLectureId(lectureId);

        Mockito.verify(lectureRepository).delete(lecture);
    }
}
