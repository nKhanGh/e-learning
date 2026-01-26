package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.QuizAttemptService;
import com.khangdev.elearningbe.service.QuizService;
import com.khangdev.elearningbe.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuizService quizService;

    @MockBean
    private QuizAttemptService quizAttemptService;

    @MockBean
    private UserService userService;

    private ObjectMapper objectMapper;
    private QuizResponse quizResponse;
    private QuizAttemptResponse attemptResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        quizResponse = QuizResponse.builder()
                .id(UUID.randomUUID())
                .title("Quiz")
                .build();
        attemptResponse = QuizAttemptResponse.builder().build();
        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();
    }

    @Test
    void createQuiz_success() throws Exception {
        Mockito.when(quizService.createQuiz(ArgumentMatchers.any()))
                .thenReturn(quizResponse);

        QuizRequest request = QuizRequest.builder().title("Quiz").build();

        mockMvc.perform(MockMvcRequestBuilders.post("/quizzes")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateQuiz_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizService.updateQuiz(ArgumentMatchers.eq(quizId), ArgumentMatchers.any()))
                .thenReturn(quizResponse);

        QuizUpdateRequest request = QuizUpdateRequest.builder().title("Updated").build();

        mockMvc.perform(MockMvcRequestBuilders.put("/quizzes/{quizId}", quizId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getByLectureId_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(quizService.getByLectureId(ArgumentMatchers.eq(lectureId)))
                .thenReturn(quizResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/lecture/{lectureId}", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getPublicQuizByLectureId_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(quizService.getPublicQuizByLectureId(ArgumentMatchers.eq(lectureId)))
                .thenReturn(quizResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/public/lecture/{lectureId}", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getQuizById_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizService.getByQuizId(ArgumentMatchers.eq(quizId)))
                .thenReturn(quizResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/{quizId}", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getPublicQuizByQuizId_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizService.getPublicQuizByQuizId(ArgumentMatchers.eq(quizId)))
                .thenReturn(quizResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/public/{quizId}", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteById_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.doNothing().when(quizService).deleteById(ArgumentMatchers.eq(quizId));

        mockMvc.perform(MockMvcRequestBuilders.delete("/quizzes/{quizId}", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Quiz delete successfully!"));
    }

    @Test
    void attemptQuiz_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizAttemptService.attemptQuiz(ArgumentMatchers.eq(quizId)))
                .thenReturn(attemptResponse);

        mockMvc.perform(MockMvcRequestBuilders.post("/quizzes/{quizId}/attempts", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void submit_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(quizAttemptService.submitQuiz(ArgumentMatchers.eq(quizId), ArgumentMatchers.any()))
                .thenReturn(attemptResponse);

        QuizSubmitRequest request = QuizSubmitRequest.builder().answers(List.of()).build();

        mockMvc.perform(MockMvcRequestBuilders.put("/quizzes/{quizId}/submission", quizId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void getUserAttempt_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Integer attemptNumber = 1;
        Mockito.when(quizAttemptService.getAttempt(ArgumentMatchers.eq(userId), ArgumentMatchers.eq(quizId),
                ArgumentMatchers.eq(attemptNumber)))
                .thenReturn(attemptResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/{quizId}/users/{userId}/attempts/{attemptNumber}", quizId,
                userId, attemptNumber))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getMyAttempt_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Integer attemptNumber = 1;
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(quizAttemptService.getAttempt(ArgumentMatchers.eq(userResponse.getId()),
                ArgumentMatchers.eq(quizId), ArgumentMatchers.eq(attemptNumber)))
                .thenReturn(attemptResponse);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/quizzes/quizzes/{quizId}/attempts/{attemptNumber}", quizId, attemptNumber))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getMyAttempts_success() throws Exception {
        UUID quizId = UUID.randomUUID();
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(quizAttemptService.getAllAttempts(ArgumentMatchers.eq(userResponse.getId()),
                ArgumentMatchers.eq(quizId)))
                .thenReturn(List.of(attemptResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/quizzes/{quizId}/attempts", quizId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}
