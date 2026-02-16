package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.enums.ReactionType;
import com.khangdev.elearningbe.service.interaction.MessageReactionService;
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
public class MessageReactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessageReactionService messageReactionService;

    private MessageReactionResponse response;

    @BeforeEach
    void setUp() {
        response = MessageReactionResponse.builder().build();
    }

    @Test
    void reaction_success() throws Exception {
        UUID messageId = UUID.randomUUID();
        Mockito.when(
                messageReactionService.react(ArgumentMatchers.eq(messageId), ArgumentMatchers.eq(ReactionType.LIKE)))
                .thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/messages/{messageId}/reaction", messageId)
                .param("reaction", ReactionType.LIKE.name())
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void getReaction_success() throws Exception {
        UUID messageId = UUID.randomUUID();
        Mockito.when(messageReactionService.getReactions(ArgumentMatchers.eq(messageId)))
                .thenReturn(List.of(response));

        mockMvc.perform(MockMvcRequestBuilders.get("/messages/{messageId}/reaction", messageId)
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}