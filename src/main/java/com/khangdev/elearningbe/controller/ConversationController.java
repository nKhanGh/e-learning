package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.service.interaction.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/conversations")
public class ConversationController {
    private final ConversationService conversationService;

    @GetMapping
    ApiResponse<List<ConversationResponse>> getMyConversations() {
        return ApiResponse.<List<ConversationResponse>>builder()
                .result(conversationService.getMyConversations())
                .build();
    }

    @GetMapping("/search")
    ApiResponse<List<ConversationResponse>> searchConversations(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "false") boolean isGroup
    ) {
        return ApiResponse.<List<ConversationResponse>>builder()
                .result(conversationService.searchConversations(keyword, isGroup))
                .build();
    }

    @PostMapping
    ApiResponse<ConversationResponse> createConversation(
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile,
            @RequestPart(value = "data") ConversationCreationRequest request
    ) throws IOException {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.createConversation(request, avatarFile))
                .build();
    }

    @PutMapping("/avatar/{conversationId}")
    ApiResponse<ConversationResponse> changeAvatar(
            @PathVariable UUID conversationId,
            @RequestPart(value = "avatarFile") MultipartFile avatarFile
    ) throws IOException {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.changeAvatar(conversationId, avatarFile))
                .build();
    }

    @PutMapping("/name/{conversationId}")
    ApiResponse<ConversationResponse> changeName(
            @PathVariable UUID conversationId,
            @RequestParam String newName
    ){
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.rename(conversationId, newName))
                .build();
    }

    @DeleteMapping("/{conversationId}")
    ApiResponse<Void> deleteConversation(@PathVariable UUID conversationId) {
        conversationService.deleteConversation(conversationId);
        return ApiResponse.<Void>builder()
                .message("Conversation deleted successfully!")
                .build();
    }

}
