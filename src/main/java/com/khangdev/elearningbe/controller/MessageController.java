package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.dto.webSocket.ConversationEvent;
import com.khangdev.elearningbe.dto.webSocket.TypingNotification;
import com.khangdev.elearningbe.dto.webSocket.UserStatusEvent;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ConversationEventType;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/messages")
public class MessageController {
    private final MessageService messageService;
    private final UserService userService;
    private final RedisService redisService;
    private final FileService fileService;
    private final ConversationParticipantService  conversationParticipantService;

    private final SimpMessagingTemplate messagingTemplate;

    private final UserRepository userRepository;

    static final String USER_ONLINE_KEY = "ws:user:";
    static final String LAST_SEEN_KEY = "ws:lastSeen:";

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageSendRequest request, Principal principal) {
        try{
            MessageResponse messageResponse = messageService.sendMessage(request);

            messagingTemplate.convertAndSend(
                "/topic/conversations." + request.getConversationId().toString(),
                ConversationEvent.builder()
                    .type(ConversationEventType.MESSAGE)
                    .data(messageResponse)
                    .build()
                );
        } catch (AppException e) {
            log.error(e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload TypingNotification request, Principal principal) {
        String email =  principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        request.setUserId(user.getId());
        try{
            messagingTemplate.convertAndSend(
                "/topic/conversations." + request.getConversationId().toString(),
                ConversationEvent.builder()
                    .type(ConversationEventType.TYPING)
                    .data(request)
                    .build()
            );
        } catch (AppException e) {
            log.error(e.getMessage());
        }
    }

    @MessageMapping("/chat.read")
    public void readMessage(@Payload UUID conversationId, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        try{
            conversationParticipantService.markAsRead(conversationId, user.getId());
            messagingTemplate.convertAndSend(
                "/topic/conversations." + conversationId.toString(),
                ConversationEvent.builder()
                    .type(ConversationEventType.READ)
                    .data(user.getId())
                    .build()
            );
        } catch (AppException e) {
            log.error(e.getMessage());
        }
    }


    @PostMapping
    public ApiResponse<MessageResponse> sendMessageRest(@RequestBody MessageSendRequest request) {

        MessageResponse messageResponse = messageService.sendMessage(request);

        messagingTemplate.convertAndSend(
                "/topic/conversations." + request.getConversationId().toString(),
                ConversationEvent.builder()
                        .type(ConversationEventType.MESSAGE)
                        .data(messageResponse)
                        .build()
        );
        return ApiResponse.<MessageResponse>builder()
                .result(messageResponse)
                .build();
    }

    @PostMapping("/send-file")
    public ApiResponse<MessageResponse> sendFileMessage(@RequestParam MultipartFile file, @RequestParam UUID conversationId, Principal principal) throws IOException, IOException {
        String fileName = fileService.uploadChatFile(file);
        MessageSendRequest request = MessageSendRequest.builder()
                .conversationId(conversationId)
                .content(fileName)
                .build();
        sendMessage(request, principal);
        return ApiResponse.<MessageResponse>builder()
                .result(null)
                .message("File sent")
                .build();
    }

    @MessageMapping("/user.online.request")
    public void sendOnlineUsers(Principal principal) {
        List<UserStatusEvent> result = new ArrayList<>();

        Set<String> onlineKeys = redisService.getKeys(USER_ONLINE_KEY + "*");
        if(onlineKeys != null && !onlineKeys.isEmpty()) {
            for (String key: onlineKeys) {
                String userId = key.replace(USER_ONLINE_KEY, "");
                String onlineStatus = redisService.getValue(key);
                if("true".equals(onlineStatus)) {
                    result.add(
                            UserStatusEvent.builder()
                                    .userId(userId)
                                    .online(true)
                                    .timestamp(null)
                                    .build()
                    );
                }
            }
        }

        Set<String> lastSeen = redisService.getKeys(LAST_SEEN_KEY + "*");
        if(lastSeen != null && !lastSeen.isEmpty()) {
            for (String key: lastSeen) {
                String userId = key.replace(LAST_SEEN_KEY, "");
                String timeStamp = redisService.getValue(key);

                result.add(
                        UserStatusEvent.builder()
                                .timestamp(Instant.parse(timeStamp))
                                .online(false)
                                .userId(userId)
                                .build()
                );
            }
        }

        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/user-status-init",result
        );
    }








}
