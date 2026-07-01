package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseSectionMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.service.course.CourseSectionService;
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
public class CourseSectionServiceTest {

    @Autowired
    private CourseSectionService courseSectionService;

    @MockBean
    private CourseSectionRepository courseSectionRepository;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private CourseSectionMapper courseSectionMapper;

    @Test

    void getCourseSectionById_success() {
        UUID sectionId = UUID.randomUUID();
        CourseSection section = CourseSection.builder().id(sectionId).title("Section").build();
        CourseSectionResponse response = CourseSectionResponse.builder().id(sectionId).title("Section").build();

        Mockito.when(courseSectionRepository.findById(sectionId))
                .thenReturn(Optional.of(section));
        Mockito.when(courseSectionMapper.toResponse(section))
                .thenReturn(response);

        CourseSectionResponse result = courseSectionService.getCourseSectionById(sectionId);

        Assertions.assertThat(result.getId()).isEqualTo(sectionId);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void createCourseSection_courseNotFound_throwException() {
        UUID courseId = UUID.randomUUID();
        CourseSectionRequest request = CourseSectionRequest.builder()
                .courseId(courseId)
                .title("Section")
                .build();

        CourseSection section = CourseSection.builder().title("Section").build();

        Mockito.when(courseSectionMapper.toEntity(request)).thenReturn(section);
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> courseSectionService.createCourseSection(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.COURSE_NOT_FOUND);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void createCourseSection_success() {
        UUID courseId = UUID.randomUUID();
        CourseSectionRequest request = CourseSectionRequest.builder()
                .courseId(courseId)
                .title("Section")
                .build();

        Course course = Course.builder().id(courseId).build();
        CourseSection section = CourseSection.builder().title("Section").build();
        CourseSectionResponse response = CourseSectionResponse.builder().title("Section").build();

        Mockito.when(courseSectionMapper.toEntity(request)).thenReturn(section);
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        Mockito.when(courseSectionRepository.save(section)).thenReturn(section);
        Mockito.when(courseSectionMapper.toResponse(section)).thenReturn(response);

        CourseSectionResponse result = courseSectionService.createCourseSection(request);

        Assertions.assertThat(result.getTitle()).isEqualTo("Section");
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void updateCourseSection_success() {
        UUID sectionId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();
        CourseSectionRequest request = CourseSectionRequest.builder()
                .courseId(courseId)
                .title("Updated")
                .build();

        CourseSection section = CourseSection.builder().id(sectionId).build();
        Course course = Course.builder().id(courseId).build();
        CourseSectionResponse response = CourseSectionResponse.builder().id(sectionId).title("Updated").build();

        Mockito.when(courseSectionRepository.findById(sectionId)).thenReturn(Optional.of(section));
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        Mockito.when(courseSectionRepository.save(section)).thenReturn(section);
        Mockito.when(courseSectionMapper.toResponse(section)).thenReturn(response);

        CourseSectionResponse result = courseSectionService.updateCourseSection(sectionId, request);

        Assertions.assertThat(result.getTitle()).isEqualTo("Updated");
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void deleteCourseSection_success() {
        UUID sectionId = UUID.randomUUID();

        courseSectionService.deleteCourseSection(sectionId);

        Mockito.verify(courseSectionRepository).deleteById(sectionId);
    }

    @Test
    void getCourseSectionByCourse_success() {
        UUID courseId = UUID.randomUUID();
        CourseSection section = CourseSection.builder().id(UUID.randomUUID()).title("Section").build();
        CourseSectionResponse response = CourseSectionResponse.builder().id(section.getId()).title("Section").build();

        Mockito.when(courseSectionRepository.findByCourseId(courseId)).thenReturn(java.util.List.of(section));
        Mockito.when(courseSectionMapper.toResponse(section)).thenReturn(response);

        var result = courseSectionService.getCourseSectionByCourse(courseId);

        Assertions.assertThat(result).hasSize(1);
    }
}
