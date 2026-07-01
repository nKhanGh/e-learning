package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.request.course.NoteRequest;
import com.khangdev.elearningbe.dto.response.LectureProgressResponse;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.response.course.PublicLectureResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.course.LectureProgressService;
import com.khangdev.elearningbe.service.course.LectureService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(username = "Khang", roles = "ADMIN")
public class LectureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LectureService lectureService;

    @MockBean
    private LectureProgressService lectureProgressService;

    @MockBean
    private UserService userService;

    private ObjectMapper objectMapper;
    private LectureResponse lectureResponse;
    private PublicLectureResponse publicLectureResponse;
    private LectureProgressResponse progressResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        lectureResponse = LectureResponse.builder()
                .id(UUID.randomUUID())
                .title("Lecture 1")
                .build();
        publicLectureResponse = PublicLectureResponse.builder()
                .id(UUID.randomUUID())
                .title("Public Lecture")
                .build();
        progressResponse = LectureProgressResponse.builder().build();
        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();
    }

    @Test
    void getLecturesBySectionId_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.when(lectureService.getLecturesBySectionId(ArgumentMatchers.eq(sectionId)))
                .thenReturn(List.of(lectureResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/section/{sectionId}", sectionId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getGeneralLecturesBySectionId_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.when(lectureService.getGeneralLecturesBySectionId(ArgumentMatchers.eq(sectionId)))
                .thenReturn(List.of(publicLectureResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/section/{sectionId}/general", sectionId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getPublicLecturesBySectionId_success() throws Exception {
        UUID sectionId = UUID.randomUUID();
        Mockito.when(lectureService.getPublicLecturesBySectionId(ArgumentMatchers.eq(sectionId)))
                .thenReturn(List.of(lectureResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/public/section/{sectionId}", sectionId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getByLectureId_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureService.getByLectureId(ArgumentMatchers.eq(lectureId)))
                .thenReturn(lectureResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/{lectureId}", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getPublicLectureByLectureId_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureService.getPublicLectureByLectureId(ArgumentMatchers.eq(lectureId)))
                .thenReturn(lectureResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/public/{lectureId}", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void createLecture_success() throws Exception {
        Mockito.when(lectureService.createLecture(ArgumentMatchers.any()))
                .thenReturn(lectureResponse);

        LectureRequest request = LectureRequest.builder()
                .title("Lecture 1")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.post("/lectures")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void updateLecture_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureService.updateLecture(ArgumentMatchers.eq(lectureId), ArgumentMatchers.any()))
                .thenReturn(lectureResponse);

        LectureUpdateRequest request = LectureUpdateRequest.builder()
                .title("Updated")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.put("/lectures/{lectureId}", lectureId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteByLectureId_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.doNothing().when(lectureService).deleteByLectureId(ArgumentMatchers.eq(lectureId));

        mockMvc.perform(MockMvcRequestBuilders.delete("/lectures/{lectureId}", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Lecture deleted complete!"));
    }

    @Test
    void createProgress_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureProgressService.createLectureProgress(ArgumentMatchers.eq(lectureId)))
                .thenReturn(progressResponse);

        mockMvc.perform(MockMvcRequestBuilders.post("/lectures/{lectureId}/progress", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void markAsCompleted_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureProgressService.markAsCompleted(ArgumentMatchers.eq(lectureId)))
                .thenReturn(progressResponse);

        mockMvc.perform(MockMvcRequestBuilders.post("/lectures/{lectureId}/progress/completion", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getMyProgress_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressService.getProgress(ArgumentMatchers.eq(userResponse.getId()),
                ArgumentMatchers.eq(lectureId)))
                .thenReturn(progressResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/{lectureId}/progress", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"INSTRUCTOR"})
    void getProgress_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Mockito.when(lectureProgressService.getProgress(ArgumentMatchers.eq(userId), ArgumentMatchers.eq(lectureId)))
                .thenReturn(progressResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/{lectureId}/users/{userId}/progress", lectureId, userId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getMyCourseLectureProgress_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(lectureProgressService.getCourseProgress(ArgumentMatchers.eq(userResponse.getId()),
                ArgumentMatchers.eq(courseId)))
                .thenReturn(List.of(progressResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/courses/{courseId}/progress", courseId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    @WithMockUser(username = "Khang", authorities = {"INSTRUCTOR"})
    void getCourseLectureProgress_success() throws Exception {
        UUID courseId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Mockito.when(
                lectureProgressService.getCourseProgress(ArgumentMatchers.eq(userId), ArgumentMatchers.eq(courseId)))
                .thenReturn(List.of(progressResponse));

        mockMvc.perform(
                MockMvcRequestBuilders.get("/lectures/courses/{courseId}/users/{userId}/progresses", courseId, userId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void toggleBookmark_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureProgressService.toggleBookmark(ArgumentMatchers.eq(lectureId)))
                .thenReturn(progressResponse);

        mockMvc.perform(MockMvcRequestBuilders.put("/lectures/{lectureId}/progress/bookmark", lectureId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getBookmarks_success() throws Exception {
        Mockito.when(lectureProgressService.getBookmarkedLectures())
                .thenReturn(List.of(progressResponse));

        mockMvc.perform(MockMvcRequestBuilders.get("/lectures/bookmarks"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void addNote_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        Mockito.when(lectureProgressService.addNotes(ArgumentMatchers.eq(lectureId), ArgumentMatchers.any()))
                .thenReturn(progressResponse);

        NoteRequest noteRequest = NoteRequest.builder().note("note").build();

        mockMvc.perform(MockMvcRequestBuilders.put("/lectures/{lectureId}/progress/note", lectureId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(noteRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}