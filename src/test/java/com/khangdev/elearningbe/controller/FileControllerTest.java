package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.service.common.FileService;
import com.khangdev.elearningbe.service.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileService fileService;

    @MockBean
    private UserService userService;

    private Resource resource;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        resource = new ByteArrayResource("test".getBytes());
        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .build();
    }

    @Test
    void downloadAvatar_success() throws Exception {
        Mockito.when(fileService.loadAvatarFile(ArgumentMatchers.anyString()))
                .thenReturn(resource);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/files/avatar/{fileName}", "avatar.jpg"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.IMAGE_JPEG));
    }

    @Test
    void downloadProtectedFile_success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        long expires = System.currentTimeMillis() + 1000;

        Mockito.when(fileService.verifySignedUrl(ArgumentMatchers.anyString(), ArgumentMatchers.eq(lectureId),
                ArgumentMatchers.eq(userId), ArgumentMatchers.eq(expires), ArgumentMatchers.anyString()))
                .thenReturn(true);
        Mockito.when(fileService.loadProtectedFile(ArgumentMatchers.anyString(), ArgumentMatchers.anyString()))
                .thenReturn(resource);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/files/protected/{fileName}", "video-demo.mp4")
                        .param("lectureId", lectureId.toString())
                        .param("userId", userId.toString())
                        .param("expires", String.valueOf(expires))
                        .param("signature", "sig"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.parseMediaType("video/mp4")));
    }

    @Test
    void generateSignedUrl_success() throws Exception {
        UUID lectureId = UUID.randomUUID();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(fileService.hasAccessPermission(ArgumentMatchers.eq(lectureId),
                ArgumentMatchers.eq(userResponse.getId())))
                .thenReturn(true);
        Mockito.when(fileService.generateSignedUrl(ArgumentMatchers.eq("video.mp4"), ArgumentMatchers.eq(lectureId),
                ArgumentMatchers.eq(userResponse.getId())))
                .thenReturn("https://signed-url");
        Mockito.when(fileService.getVideoTokenExpiration()).thenReturn(3600);

        mockMvc.perform(
                MockMvcRequestBuilders.get("/files/signed-url")
                        .param("fileName", "video.mp4")
                        .param("lectureId", lectureId.toString()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("signedUrl").value("https://signed-url"))
                .andExpect(MockMvcResultMatchers.jsonPath("expiresIn").value(3600));
    }
}