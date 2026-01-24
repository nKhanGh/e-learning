package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.enums.ReactionType;

import java.util.List;
import java.util.UUID;

public interface MessageReactionService {
    MessageReactionResponse react(UUID messageId, ReactionType reaction);
    List<MessageReactionResponse> getReactions(UUID messageId);
}
