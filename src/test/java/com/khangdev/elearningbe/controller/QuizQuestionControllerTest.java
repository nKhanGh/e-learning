package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.service.QuizQuestionService;
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
public class QuizQuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuizQuestionService quizQuestionService;

    private ObjectMapper objectMapper;
    private QuizQuestionResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        response = QuizQuestionResponse.builder()
                .id(UUID.randomUUID())
                .questionText("Question")
                .build();
    }

    @Test
    void findByQuizId_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizQuestionService.findByQuizId(ArgumentMatchers.eq(quizId)))
                .thenReturn(List.of(response));

        mockMvc.perform(MockMvcRequestBuilders.get("/quiz-questions/{quizId}", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void createQuizQuestion_success() throws Exception {
        Mockito.when(quizQuestionService.createQuizQuestion(ArgumentMatchers.any()))
                .thenReturn(response);

        QuizQuestionRequest request = QuizQuestionRequest.builder()
                .questionText("Question")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.post("/quiz-questions")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteQuizQuestion_success() throws Exception {
        UUID quizQuestionId = UUID.randomUUID();
        Mockito.doNothing().when(quizQuestionService).deleteQuizQuestion(ArgumentMatchers.eq(quizQuestionId));

        mockMvc.perform(MockMvcRequestBuilders.delete("/quiz-questions/{quizQuestionId}", quizQuestionId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Quiz question delete successfully!"));
    }

    @Test
    void updateQuizQuestion_success() throws Exception {
        UUID quizQuestionId = UUID.randomUUID();
        Mockito.when(
                quizQuestionService.updateQuizQuestion(ArgumentMatchers.eq(quizQuestionId), ArgumentMatchers.any()))
                .thenReturn(response);

        QuizQuestionUpdateRequest request = QuizQuestionUpdateRequest.builder()
                .questionText("Updated")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.put("/quiz-questions/{quizQuestionId}", quizQuestionId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}
