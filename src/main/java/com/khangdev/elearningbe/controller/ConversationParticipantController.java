package com.khangdev.elearningbe.controller;


import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.service.interaction.ConversationParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/conversations/{conversationId}/participants")
public class ConversationParticipantController {

    private final ConversationParticipantService conversationParticipantService;

    @PostMapping("/me")
    public ApiResponse<ConversationParticipantResponse> join(@PathVariable UUID conversationId) {
        return ApiResponse.<ConversationParticipantResponse>builder()
                .result(conversationParticipantService.joinConversation(conversationId))
                .build();
    }

    @DeleteMapping("/me")
    public ApiResponse<ConversationParticipantResponse> leave(@PathVariable UUID conversationId) {
        return ApiResponse.<ConversationParticipantResponse>builder()
                .result(conversationParticipantService.leaveConversation(conversationId))
                .build();
    }

    @PostMapping("/{participantId}")
    public ApiResponse<ConversationParticipantResponse> add(
            @PathVariable UUID conversationId,
            @PathVariable UUID participantId
    ) {
        return ApiResponse.<ConversationParticipantResponse>builder()
                .result(conversationParticipantService.addParticipant(conversationId, participantId))
                .build();
    }

    @DeleteMapping("/{participantId}")
    public ApiResponse<ConversationParticipantResponse> remove(
            @PathVariable UUID conversationId,
            @PathVariable UUID participantId
    ) {
        return ApiResponse.<ConversationParticipantResponse>builder()
                .result(conversationParticipantService.removeParticipant(conversationId, participantId))
                .build();
    }
}

