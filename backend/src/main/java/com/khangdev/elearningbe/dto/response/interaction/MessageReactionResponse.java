package com.khangdev.elearningbe.dto.response.interaction;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.MessageReactionId;
import com.khangdev.elearningbe.enums.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReactionResponse {
    private MessageReactionId id;
    private MessageResponse message;
    private UserResponse user;
    private ReactionType reaction;
}
