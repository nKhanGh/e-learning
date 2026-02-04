package com.khangdev.elearningbe.service.impl.interaction;

import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.dto.webSocket.UnreadCountEvent;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import com.khangdev.elearningbe.entity.interaction.Message;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.MessageMapper;
import com.khangdev.elearningbe.repository.ConversationParticipantRepository;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.MessageRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.MessageService;
import com.khangdev.elearningbe.service.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;

    private final SimpMessagingTemplate simpMessagingTemplate;

    private final UserService userService;

    private final MessageMapper  messageMapper;

    @Override
    @Transactional
    public MessageResponse sendMessage(MessageSendRequest request) {
        UUID userId = userService.getMyInfo().getId();
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        Message parent = null;
        if(request.getParentId() != null) {
            parent = messageRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));
        }
        Message message = Message.builder()
                .content(request.getContent())
                .conversation(conversation)
                .parent(parent)
                .sender(sender)
                .build();

        messageRepository.save(message);
        updateUnreadMessage(message.getConversation().getId(), sender.getId());

        return messageMapper.toResponse(message);
    }

    private void updateUnreadMessage(UUID conversationId, UUID userId){
        conversationParticipantRepository.increaseUnreadForOthers(conversationId, userId);

        List<ConversationParticipant> others =
                conversationParticipantRepository.findByConversationIdAndUserIdNot(conversationId, userId);
        others.forEach(p -> {
            simpMessagingTemplate.convertAndSendToUser(
                    p.getUser().getEmail(),
                    "topic/unread-count",
                    UnreadCountEvent.builder()
                            .count(p.getUnreadCount())
                            .conversationId(conversationId)
                            .build()
            );
        });
    }
}
