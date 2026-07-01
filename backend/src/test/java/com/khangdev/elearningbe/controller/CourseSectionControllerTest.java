package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;
import com.khangdev.elearningbe.service.course.CourseSectionService;
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
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class CourseSectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseSectionService courseSectionService;

    private ObjectMapper objectMapper;
    private CourseSectionResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        response = CourseSectionResponse.builder()
                .id(UUID.randomUUID())
                .title("Section 1")
                .build();
    }

    @Test
    void getCourseSectionByCourseId_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(courseSectionService.getCourseSectionByCourse(ArgumentMatchers.eq(courseId)))
                .thenReturn(List.of(response));

        mockMvc.perform(
                MockMvcRequestBuilders.get("/course-sections/course/{courseId}", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void addCourseSection_success() throws Exception {
        Mockito.when(courseSectionService.createCourseSection(ArgumentMatchers.any()))
                .thenReturn(response);

        CourseSectionRequest request = CourseSectionRequest.builder()
                .title("Section 1")
                .build();

        mockMvc.perform(
                MockMvcRequestBuilders.post("/course-sections")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getCourseSectionById_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.when(courseSectionService.getCourseSectionById(ArgumentMatchers.eq(sectionId)))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/course-sections/{courseSectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateCourseSection_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.when(courseSectionService.updateCourseSection(ArgumentMatchers.eq(sectionId), ArgumentMatchers.any()))
                .thenReturn(response);

        CourseSectionRequest request = CourseSectionRequest.builder()
                .title("Updated")
                .build();

        mockMvc.perform(
                MockMvcRequestBuilders.put("/course-sections/{courseSectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteCourseSection_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.doNothing().when(courseSectionService).deleteCourseSection(ArgumentMatchers.eq(sectionId));

        mockMvc.perform(
                MockMvcRequestBuilders.delete("/course-sections/{courseSectionId}", sectionId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Course section deleted successfully!"));
    }
}