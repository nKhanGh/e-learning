package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;
import com.khangdev.elearningbe.service.CourseCategoryService;
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
public class CourseCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseCategoryService courseCategoryService;

    private ObjectMapper objectMapper;
    private CourseCategoryResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        response = CourseCategoryResponse.builder()
                .id(UUID.randomUUID())
                .name("Development")
                .build();
    }

    @Test
    void create_success() throws Exception {
        Mockito.when(courseCategoryService.createCourseCategory(ArgumentMatchers.any()))
                .thenReturn(response);

        CourseCategoryRequest request = CourseCategoryRequest.builder()
                .name("Development")
                .description("Dev")
                .build();

        mockMvc.perform(
                MockMvcRequestBuilders.post("/course-categories")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void list_success() throws Exception {
        Mockito.when(courseCategoryService.createCourseCategory(ArgumentMatchers.any()))
                .thenReturn(response);

        List<CourseCategoryRequest> requests = List.of(
                CourseCategoryRequest.builder().name("Development").build());

        mockMvc.perform(
                MockMvcRequestBuilders.post("/course-categories/list")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(objectMapper.writeValueAsString(requests)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}
