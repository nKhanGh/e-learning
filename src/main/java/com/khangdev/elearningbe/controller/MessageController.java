package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.dto.webSocket.*;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ConversationEventType;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.common.FileService;
import com.khangdev.elearningbe.service.common.RedisService;
import com.khangdev.elearningbe.service.interaction.ConversationParticipantService;
import com.khangdev.elearningbe.service.interaction.MessageService;
import com.khangdev.elearningbe.service.user.UserService;
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
    private final ConversationParticipantService conversationParticipantService;

    private final SimpMessagingTemplate messagingTemplate;

    private final UserRepository userRepository;

    static final String USER_ONLINE_KEY = "ws:user:";
    static final String LAST_SEEN_KEY = "ws:lastSeen:";

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageSendRequest request, Principal principal) {
        try{
            String email = principal.getName();
            MessageResponse messageResponse = messageService.sendMessage(request, email);
            List<String> userEmails = conversationParticipantService.getParticipantEmails(request.getConversationId());
            log.info(userEmails.toString());
            userEmails.forEach(userEmail -> {
                messagingTemplate.convertAndSendToUser(
                        userEmail,
                        "/queue/message",
                        ConversationEvent.builder()
                                .type(ConversationEventType.MESSAGE)
                                .data(messageResponse)
                                .build()
                );
            });


        } catch (AppException e) {
            log.error(e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTyping(@Payload TypingRequest request, Principal principal) {
        String email =  principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        log.info(request.toString());

        TypingNotification response = TypingNotification.builder()
                .conversationId(request.getConversationId())
                .userId(user.getId())
                .avatarFileName(user.getProfile().getAvatarFileName())
                .typing(request.isTyping())
                .build();
        List<String> userEmails = conversationParticipantService.getParticipantEmails(request.getConversationId());
        userEmails.forEach(userEmail -> {
            if (userEmail.equals(user.getEmail())) return;
            try{
                messagingTemplate.convertAndSendToUser(
                        userEmail,
                        "/queue/typing",
                        ConversationEvent.builder()
                                .type(ConversationEventType.TYPING)
                                .data(response)
                                .build()
                );
            } catch (AppException e) {
                log.error(e.getMessage());
            }
        });
    }

    @MessageMapping("/chat.read")
    public void readMessage(@Payload ReadRequest request, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        conversationParticipantService.markAsRead(request.getConversationId(), user.getId());
        List<String> userEmails = conversationParticipantService.getParticipantEmails(request.getConversationId());
        ReadNotification response = ReadNotification.builder()
                .userId(user.getId())
                .conversationId(request.getConversationId())
                .build();
        userEmails.forEach(userEmail -> {
            try{
                messagingTemplate.convertAndSendToUser(
                        userEmail,
                        "queue/read-receipt",
                        ConversationEvent.builder()
                                .type(ConversationEventType.READ)
                                .data(response)
                                .build()
                );
            } catch (AppException e) {
                log.error(e.getMessage());
            }
        });

    }


    @PostMapping
    public ApiResponse<MessageResponse> sendMessageRest(@RequestBody MessageSendRequest request) {
        String email = userService.getMyInfo().getEmail();
        MessageResponse messageResponse = messageService.sendMessage(request, email);

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

    @GetMapping("/conversations/{conversationId}")
    public ApiResponse<PageResponse<MessageResponse>> getConversationMessages(
            @PathVariable UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<MessageResponse>>builder()
                .result(messageService.getConversationMessage(conversationId, page, size))
                .build();
    }
}
