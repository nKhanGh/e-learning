package com.khangdev.elearningbe.dto.response.interaction;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.ConversationParticipantId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationParticipantResponse {
    private ConversationParticipantId id;
    private UserResponse user;
    private Instant lastReadAt;
    private String nickname;
}
