package com.khangdev.elearningbe.service.ai;

import com.khangdev.elearningbe.dto.request.interaction.AIChatRequest;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;

import java.util.UUID;

public interface ChatBotService {
    MessageResponse chat(MessageSendRequest request);
    void clearConversationMemory(UUID conversationId);
}
