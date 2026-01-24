package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConversationParticipantMapper {
    ConversationParticipantResponse toResponse(ConversationParticipant conversationParticipant);
}
