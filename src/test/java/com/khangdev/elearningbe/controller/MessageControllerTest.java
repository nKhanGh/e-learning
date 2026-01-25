package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.security.Principal;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessageService messageService;

    @MockBean
    private UserService userService;

    @MockBean
    private RedisService redisService;

    @MockBean
    private FileService fileService;

    @MockBean
    private ConversationParticipantService conversationParticipantService;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    @MockBean
    private UserRepository userRepository;

    private ObjectMapper objectMapper;
    private MessageResponse messageResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        messageResponse = MessageResponse.builder()
                .id(UUID.randomUUID())
                .content("hello")
                .build();
    }

    @Test
    void sendMessageRest_success() throws Exception {
        Mockito.when(messageService.sendMessage(ArgumentMatchers.any()))
                .thenReturn(messageResponse);

        MessageSendRequest request = MessageSendRequest.builder()
                .conversationId(UUID.randomUUID())
                .content("hello")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.post("/messages")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void sendFileMessage_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.when(fileService.uploadChatFile(ArgumentMatchers.any()))
                .thenReturn("file.pdf");
        Mockito.when(messageService.sendMessage(ArgumentMatchers.any()))
                .thenReturn(messageResponse);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "file.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "content".getBytes());

        Principal principal = () -> "user@example.com";

        mockMvc.perform(MockMvcRequestBuilders.multipart("/messages/send-file")
                .file(file)
                .param("conversationId", conversationId.toString())
                .principal(principal)
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("File sent"));
    }
}
