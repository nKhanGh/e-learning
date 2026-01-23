package com.khangdev.elearningbe.dto.webSocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusEvent {
    private String userId;
    private boolean online;
    private Instant timestamp = Instant.now();
}
