package com.khangdev.elearningbe.dto.request.interaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageSendRequest {
    UUID conversationId;
    UUID parentId;
    String content;
}
