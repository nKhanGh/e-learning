package com.khangdev.elearningbe.dto.response.interaction;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    Instant createdAt;
    UUID id;
    MessageResponse parent;
    UserResponse sender;
    String content;
}
