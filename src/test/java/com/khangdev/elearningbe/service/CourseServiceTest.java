package com.khangdev.elearningbe.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.entity.course.CourseTag;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.repository.CourseCategoryRepository;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseTagRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class CourseServiceTest {

    @Autowired
    private CourseService courseService;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private CourseMapper courseMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CourseCategoryRepository courseCategoryRepository;

    @MockBean
    private CourseTagRepository courseTagRepository;

    @MockBean
    private CourseTagService courseTagService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserMapper userMapper;

    @MockBean
    private RedisService redisService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCourseById_success() {
        UUID courseId = UUID.randomUUID();
        Course course = Course.builder().id(courseId).title("Course").build();
        CourseResponse response = CourseResponse.builder().id(courseId).title("Course").build();

        Mockito.when(courseRepository.findById(courseId))
                .thenReturn(Optional.of(course));
        Mockito.when(courseMapper.toResponse(course)).thenReturn(response);

        CourseResponse result = courseService.getCourseById(courseId);

        Assertions.assertThat(result.getId()).isEqualTo(courseId);
    }

    @Test
    void getCourses_success() {
        UUID instructorId = UUID.randomUUID();
        Course course = Course.builder().id(UUID.randomUUID()).title("Course").build();
        Page<Course> page = new PageImpl<>(List.of(course), PageRequest.of(0, 10), 1);
        CourseResponse response = CourseResponse.builder().id(course.getId()).title("Course").build();

        Mockito.when(courseRepository.findByInstructorId(ArgumentMatchers.eq(instructorId), ArgumentMatchers.any()))
                .thenReturn(page);
        Mockito.when(courseMapper.toResponse(course)).thenReturn(response);

        PageResponse<CourseResponse> result = courseService.getCourses(instructorId, 0, 10);

        Assertions.assertThat(result.getItems()).hasSize(1);
    }

    @Test
    void getCourseById_notFound_throwException() {
        UUID courseId = UUID.randomUUID();

        Mockito.when(courseRepository.findById(courseId))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> courseService.getCourseById(courseId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.COURSE_NOT_FOUND);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void createCourse_success() {
        UUID courseId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        CourseCreationRequest request = CourseCreationRequest.builder()
                .categoryId(categoryId)
                .title("Course")
                .slug("course")
                .description("desc")
                .tagNames(List.of("Java"))
                .build();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        User user = User.builder().id(instructorId).email("instructor@example.com").instructor(instructor).build();
        Course course = Course.builder().id(courseId).title("Course").build();
        CourseCategory category = CourseCategory.builder().id(categoryId).displayOrder(0).build();
        CourseTag tag = CourseTag.builder().name("Java").slug("java").build();
        CourseResponse response = CourseResponse.builder().id(courseId).title("Course").build();

        Mockito.when(courseMapper.toCourse(request)).thenReturn(course);
        Mockito.when(userRepository.findByEmail(ArgumentMatchers.anyString())).thenReturn(Optional.of(user));
        Mockito.when(courseCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        Mockito.when(courseTagRepository.findAllBySlugIn(List.of("java"))).thenReturn(List.of(tag));
        Mockito.when(courseMapper.toResponse(course)).thenReturn(response);
        Mockito.when(userMapper.toResponse(user))
                .thenReturn(com.khangdev.elearningbe.dto.response.user.UserResponse.builder().id(instructorId).build());

        CourseResponse result = courseService.createCourse(request);

        Assertions.assertThat(result.getId()).isEqualTo(courseId);
    }

    @Test
    void updateCourse_success() {
        UUID courseId = UUID.randomUUID();
        UUID instructorId = UUID.randomUUID();

        CourseUpdateRequest request = CourseUpdateRequest.builder()
                .title("Updated")
                .build();

        Instructor instructor = Instructor.builder().id(instructorId).build();
        User user = User.builder().id(instructorId).email("instructor@example.com").instructor(instructor).build();
        Course course = Course.builder().id(courseId).instructor(instructor).build();
        CourseResponse response = CourseResponse.builder().id(courseId).title("Updated").build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null));

        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        Mockito.when(courseMapper.toResponse(course)).thenReturn(response);

        CourseResponse result = courseService.updateCourse(courseId, request);

        Assertions.assertThat(result.getTitle()).isEqualTo("Updated");
    }

    @Test
    void searchCourse_cached_success() throws Exception {
        CourseSearchRequest request = CourseSearchRequest.builder()
                .keyword("java")
                .build();
        PageResponse<CourseResponse> cached = PageResponse.<CourseResponse>builder()
                .items(List.of(CourseResponse.builder().title("Course").build()))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        String json = objectMapper.writeValueAsString(cached);

        Mockito.when(redisService.getValue(ArgumentMatchers.anyString())).thenReturn(json);

        PageResponse<CourseResponse> result = courseService.searchCourse(request, 0, 10);

        Assertions.assertThat(result.getItems()).hasSize(1);
    }

    @Test
    void deleteCourse_success() {
        UUID courseId = UUID.randomUUID();

        courseService.deleteCourse(courseId);

        Mockito.verify(courseRepository).deleteById(courseId);
    }
}