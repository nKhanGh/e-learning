package com.khangdev.elearningbe.service.interaction;

import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;

public interface MessageService {
    MessageResponse sendMessage(MessageSendRequest request);
}
