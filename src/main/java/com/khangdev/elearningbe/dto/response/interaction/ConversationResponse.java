package com.khangdev.elearningbe.dto.response.interaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private UUID id;
    private Boolean isGroup;
    private List<ConversationParticipantResponse> participants;
    private Instant lastMessageAt;
    private String name;
    private String description;
    private String avatarUrl;
}
