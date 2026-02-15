package com.khangdev.elearningbe.service.interaction;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

public interface MessageService {
    MessageResponse sendMessage(MessageSendRequest request);
    PageResponse<MessageResponse> getConversationMessage(UUID conversationId, int page, int size);
}
