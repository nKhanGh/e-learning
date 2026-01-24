package com.khangdev.elearningbe.dto.webSocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingNotification {
    UUID userId;
    UUID conversationId;
    boolean isTyping;
}
