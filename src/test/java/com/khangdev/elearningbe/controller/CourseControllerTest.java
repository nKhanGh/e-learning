package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.course.CourseService;
import com.khangdev.elearningbe.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @MockBean
    private UserService userService;

    private ObjectMapper objectMapper;
    private CourseResponse courseResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        courseResponse = CourseResponse.builder()
                .id(UUID.randomUUID())
                .title("Demo Course")
                .build();
        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("instructor@example.com")
                .build();
    }

    @Test
    void createCourse_success() throws Exception {
        Mockito.when(courseService.createCourse(ArgumentMatchers.any()))
                .thenReturn(courseResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/courses")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Demo Course"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void searchCourses_success() throws Exception {
        PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                .page(0)
                .size(9)
                .items(List.of(courseResponse))
                .totalPages(1)
                .totalElements(1)
                .build();

        Mockito.when(courseService.searchCourse(ArgumentMatchers.any(), ArgumentMatchers.anyInt(),
                ArgumentMatchers.anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/search")
                        .param("page", "0")
                        .param("size", "9")
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateCourse_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(courseService.updateCourse(ArgumentMatchers.eq(courseId), ArgumentMatchers.any()))
                .thenReturn(courseResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.put("/courses/{courseId}", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Updated"))))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getCourse_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(courseService.getCourseById(ArgumentMatchers.eq(courseId)))
                .thenReturn(courseResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/{courseId}", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteCourse_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.doNothing().when(courseService).deleteCourse(ArgumentMatchers.eq(courseId));

        mockMvc.perform(
                MockMvcRequestBuilders.delete("/courses/{courseId}", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Course deleted successfully!"));
    }

    @Test
    void getMyCourse_success() throws Exception {
        PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                .page(0)
                .size(9)
                .items(List.of(courseResponse))
                .totalPages(1)
                .totalElements(1)
                .build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(courseService.getCourses(ArgumentMatchers.eq(userResponse.getId()), ArgumentMatchers.anyInt(),
                ArgumentMatchers.anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/my-course")
                        .param("page", "9")
                        .param("size", "0")
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getInstructorCourse_success() throws Exception {
        UUID instructorId = UUID.randomUUID();
        PageResponse<CourseResponse> pageResponse = PageResponse.<CourseResponse>builder()
                .page(0)
                .size(9)
                .items(List.of(courseResponse))
                .totalPages(1)
                .totalElements(1)
                .build();

        Mockito.when(courseService.getCourses(ArgumentMatchers.eq(instructorId), ArgumentMatchers.anyInt(),
                ArgumentMatchers.anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/instructor/{instructorId}", instructorId)
                        .param("page", "9")
                        .param("size", "0")
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}