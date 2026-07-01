package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.service.interaction.ConversationService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class ConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConversationService conversationService;

    private ObjectMapper objectMapper;
    private ConversationResponse response;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        response = ConversationResponse.builder()
                .id(UUID.randomUUID())
                .name("Chat")
                .build();
    }

    @Test
    void getMyConversations_success() throws Exception {
        Mockito.when(conversationService.getMyConversations()).thenReturn(List.of(response));

        mockMvc.perform(MockMvcRequestBuilders.get("/conversations"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void searchConversations_success() throws Exception {
        Mockito.when(
                conversationService.searchConversations(ArgumentMatchers.anyString(), ArgumentMatchers.anyBoolean()))
                .thenReturn(List.of(response));

        mockMvc.perform(MockMvcRequestBuilders.get("/conversations/search")
                .param("keyword", "chat")
                .param("isGroup", "false"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void createConversation_success() throws Exception {
        Mockito.when(conversationService.createConversation(ArgumentMatchers.any(), ArgumentMatchers.isNull()))
                .thenReturn(response);

        ConversationCreationRequest request = ConversationCreationRequest.builder()
                .name("Chat")
                .build();

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request));

        mockMvc.perform(MockMvcRequestBuilders.multipart("/conversations")
                .file(dataPart)
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void changeAvatar_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.when(conversationService.changeAvatar(ArgumentMatchers.eq(conversationId), ArgumentMatchers.any()))
                .thenReturn(response);

        MockMultipartFile avatar = new MockMultipartFile(
                "avatarFile",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "content".getBytes());

        mockMvc.perform(MockMvcRequestBuilders.multipart("/conversations/avatar/{conversationId}", conversationId)
                .file(avatar)
                .with(req -> {
                    req.setMethod("PUT");
                    return req;
                })
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void changeName_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.when(conversationService.rename(ArgumentMatchers.eq(conversationId), ArgumentMatchers.anyString()))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.put("/conversations/name/{conversationId}", conversationId)
                .param("newName", "New Name"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void deleteConversation_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.doNothing().when(conversationService).deleteConversation(ArgumentMatchers.eq(conversationId));

        mockMvc.perform(MockMvcRequestBuilders.delete("/conversations/{conversationId}", conversationId))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Conversation deleted successfully!"));
    }
}
