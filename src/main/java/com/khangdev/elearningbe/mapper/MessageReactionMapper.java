package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.entity.interaction.MessageReaction;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageReactionMapper {
    MessageReactionResponse toResponse(MessageReaction messageReaction);
}
