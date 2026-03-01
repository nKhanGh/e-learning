package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConversationMapper {

    @Mapping(target = "isAi", source = "ai")
    ConversationResponse toResponse(Conversation conversation);


}
