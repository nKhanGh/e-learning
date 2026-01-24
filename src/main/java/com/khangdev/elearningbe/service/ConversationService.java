package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface ConversationService {
    List<ConversationResponse> getMyConversations();
    List<ConversationResponse> searchConversations(String keyword, boolean isGroup);
    ConversationResponse createConversation(ConversationCreationRequest request, MultipartFile avatarFile) throws IOException;
    ConversationResponse changeAvatar(UUID conversationId, MultipartFile avatarFile) throws IOException;
    ConversationResponse rename(UUID conversationId, String newName);
    void deleteConversation(Conversation conversation);
}
