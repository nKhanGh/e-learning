package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;
import com.khangdev.elearningbe.service.CourseTagService;
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
public class CourseTagControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseTagService courseTagService;

    private ObjectMapper objectMapper;
    private CourseTagResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        response = CourseTagResponse.builder()
                .id(UUID.randomUUID())
                .name("java")
                .build();
    }

    @Test
    void create_success() throws Exception {
        Mockito.when(courseTagService.createCourseTag(ArgumentMatchers.any()))
                .thenReturn(response);

        CourseTagRequest request = CourseTagRequest.builder()
                .name("java")
                .build();

        mockMvc.perform(
                MockMvcRequestBuilders.post("/course-tags")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void list_success() throws Exception {
        Mockito.when(courseTagService.createCourseTag(ArgumentMatchers.any()))
                .thenReturn(response);

        List<CourseTagRequest> requests = List.of(
                CourseTagRequest.builder().name("java").build());

        mockMvc.perform(
                MockMvcRequestBuilders.post("/course-tags/list")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(requests)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}
