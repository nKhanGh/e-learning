package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.entity.interaction.Message;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageResponse toResponse(Message message);
}
