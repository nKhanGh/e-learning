package com.khangdev.elearningbe.configuration;

import com.khangdev.elearningbe.dto.webSocket.UserStatusEvent;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.RedisService;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository  userRepository;
    private final RedisService redisService;

    static final String SESSION_KEY = "ws:session:";  // sessionId -> userId
    static final String USER_ONLINE_KEY = "ws:user:"; // userId -> true/false
    static final String LAST_SEEN_KEY = "ws:lastSeen:"; // userId -> timestamp

    @Getter
    Map<String, Instant> lastSeen = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if(accessor.getUser() != null) {
            String email = accessor.getUser().getName();
            UUID userId = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)).getId();
            redisService.setValue(SESSION_KEY + sessionId, userId.toString(), 24, TimeUnit.HOURS);
            redisService.setValueNoExpire(USER_ONLINE_KEY + userId, "true");
            redisService.deleteKey(LAST_SEEN_KEY + userId);
            messagingTemplate.convertAndSend("/topic/user.online", UserStatusEvent.builder()
                    .userId(userId.toString())
                    .timestamp(Instant.now())
                    .online(true)
            );
        }
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        String userId = redisService.getValue(SESSION_KEY + sessionId);
        redisService.deleteKey(SESSION_KEY + sessionId);

        if(userId != null){
            log.info("User disconnected: {} with session: {}", userId, sessionId);
            boolean stillOnline = hasOtherSession(userId);
            if(!stillOnline){
                redisService.setValueNoExpire(USER_ONLINE_KEY + userId, "false");
                redisService.setValueNoExpire(LAST_SEEN_KEY + userId, Instant.now().toString());
                messagingTemplate.convertAndSend("/topic/user.online", UserStatusEvent
                        .builder()
                        .online(false)
                        .userId(userId)
                        .timestamp(Instant.now())
                        .build());
            }
        }
    }

    private boolean hasOtherSession(String userId){
        Set<String> keys = redisService.getKeys("ws:session:*");
        if( keys == null || keys.isEmpty() ){
            return false;
        }

        for(String key : keys){
            String uid   = redisService.getValue(key);
            if(uid.equals(userId)){
                return true;
            }
        }

        return false;
    }




}
