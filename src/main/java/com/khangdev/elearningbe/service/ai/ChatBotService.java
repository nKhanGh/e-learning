package com.khangdev.elearningbe.service.ai;

import com.khangdev.elearningbe.dto.request.interaction.AIChatRequest;
import com.khangdev.elearningbe.dto.request.interaction.AIChatResponse;

import java.util.UUID;

public interface ChatBotService {
    AIChatResponse chat(AIChatRequest request);
    void clearConversationMemory(UUID conversationId);
}
