package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.service.EnrollmentService;
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
public class EnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EnrollmentService enrollmentService;

    private EnrollmentResponse response;

    @BeforeEach
    void setUp() {
        response = EnrollmentResponse.builder().build();
    }

    @Test
    void create_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(enrollmentService.createEnrollment(ArgumentMatchers.eq(courseId)))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.post("/courses/{courseId}/enrollments", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Enrollment created successfully"));
    }

    @Test
    void getEnrollmentsByCourseId_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(enrollmentService.getEnrollmentsByCourseId(ArgumentMatchers.eq(courseId)))
                .thenReturn(List.of(response));

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/{courseId}/enrollments", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Enrollments found successfully"));
    }

    @Test
    void getEnrollmentsByUserId_success() throws Exception {
        UUID userId = UUID.randomUUID();
        Mockito.when(enrollmentService.getEnrollmentsByUserId(ArgumentMatchers.eq(userId)))
                .thenReturn(List.of(response));

        mockMvc.perform(
                MockMvcRequestBuilders.get("/users/{userId}/enrollments", userId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Enrollments found successfully"));
    }

    @Test
    void getEnrollment_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Mockito.when(enrollmentService.getEnrollmentById(ArgumentMatchers.any()))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/courses/{courseId}/users/{userId}/enrollments", courseId, userId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Enrollment found successfully"));
    }

    @Test
    void access_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(enrollmentService.access(ArgumentMatchers.eq(courseId)))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.put("/courses/{courseId}/access", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void completion_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(enrollmentService.complete(ArgumentMatchers.eq(courseId)))
                .thenReturn(response);

        mockMvc.perform(
                MockMvcRequestBuilders.put("/courses/{courseId}/completion", courseId)
                        .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}
