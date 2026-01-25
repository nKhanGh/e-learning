package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.service.ConversationParticipantService;
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

import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class ConversationParticipantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConversationParticipantService conversationParticipantService;

    private ConversationParticipantResponse response;

    @BeforeEach
    void setUp() {
        response = ConversationParticipantResponse.builder().build();
    }

    @Test
    void join_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.when(conversationParticipantService.joinConversation(ArgumentMatchers.eq(conversationId)))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/conversations/{conversationId}/participants/me", conversationId)
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void leave_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        Mockito.when(conversationParticipantService.leaveConversation(ArgumentMatchers.eq(conversationId)))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.delete("/conversations/{conversationId}/participants/me", conversationId)
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void add_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();
        Mockito.when(conversationParticipantService.addParticipant(ArgumentMatchers.eq(conversationId),
                ArgumentMatchers.eq(participantId)))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders
                .post("/conversations/{conversationId}/participants/{participantId}", conversationId, participantId)
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void remove_success() throws Exception {
        UUID conversationId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();
        Mockito.when(conversationParticipantService.removeParticipant(ArgumentMatchers.eq(conversationId),
                ArgumentMatchers.eq(participantId)))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders
                .delete("/conversations/{conversationId}/participants/{participantId}", conversationId, participantId)
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}