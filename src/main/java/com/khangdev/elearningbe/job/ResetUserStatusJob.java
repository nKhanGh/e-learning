package com.khangdev.elearningbe.job;

import com.khangdev.elearningbe.dto.webSocket.UserStatusEvent;
import com.khangdev.elearningbe.service.common.RedisService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ResetUserStatusJob {
    private final RedisService redisService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostConstruct
    public void resetAllUser(){
        Set<String> sessionKeys = redisService.getKeys("ws:session:*");
        if (sessionKeys != null) {
            for (String key : sessionKeys) {
                redisService.deleteKey(key);
            }
        }

        Set<String> keys = redisService.getKeys("ws:user:*");
        for (String key : keys) {
            String userId = key.replace("ws:user:", "");
            String isOffline = redisService.getValue(key);
            if(isOffline.equals("false"))
                continue;
            redisService.setValueNoExpire(key, "false");
            redisService.setValueNoExpire("ws:lastSeen:" + userId, Instant.now().toString());
            messagingTemplate.convertAndSend("/topic/user.online",
                    UserStatusEvent.builder()
                            .online(false)
                            .userId(userId)
                            .timestamp(Instant.now())
                            .build()
            );
        }
    }
}
