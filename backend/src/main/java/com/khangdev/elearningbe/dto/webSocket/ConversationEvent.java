package com.khangdev.elearningbe.dto.webSocket;

import com.khangdev.elearningbe.enums.ConversationEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationEvent {
    private ConversationEventType type;
    private Object data;
}
