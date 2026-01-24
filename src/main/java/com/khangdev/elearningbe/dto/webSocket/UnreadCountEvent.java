package com.khangdev.elearningbe.dto.webSocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.NonFinal;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountEvent {
    private Long count;
    private UUID conversationId;
    private Instant timestamp = Instant.now();

}
