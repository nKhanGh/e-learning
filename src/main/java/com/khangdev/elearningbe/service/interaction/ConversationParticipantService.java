package com.khangdev.elearningbe.service.interaction;

import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;

import java.util.UUID;

public interface ConversationParticipantService {
    ConversationParticipantResponse joinConversation(UUID conversationId);
    ConversationParticipantResponse addParticipant(UUID conversationId, UUID participantId);
    ConversationParticipantResponse leaveConversation(UUID conversationId);
    ConversationParticipantResponse removeParticipant(UUID conversationId, UUID participantId);
    void markAsRead(UUID conversationId, UUID participantId);
}
