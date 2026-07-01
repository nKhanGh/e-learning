package com.khangdev.elearningbe.service.impl.interaction;

import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.entity.id.ConversationParticipantId;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ConversationParticipantMapper;
import com.khangdev.elearningbe.repository.ConversationParticipantRepository;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.ConversationParticipantService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationParticipantServiceImpl implements ConversationParticipantService {
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    private final UserService userService;

    private final ConversationParticipantMapper conversationParticipantMapper;

    @Override
    @Transactional
    public ConversationParticipantResponse joinConversation(UUID conversationId) {
        UUID userId = userService.getMyInfo().getId();
        return add(conversationId, userId);
    }

    @Override
    @Transactional
    public ConversationParticipantResponse addParticipant(UUID conversationId, UUID participantId) {
        return add(conversationId, participantId);
    }

    private ConversationParticipantResponse add(UUID conversationId, UUID participantId) {
        User participant = userRepository.findById(participantId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        ConversationParticipant conversationParticipant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder()
                        .userId(participantId)
                        .conversationId(conversationId)
                        .build()
                )
                .user(participant)
                .conversation(conversation)
                .lastReadAt(Instant.now())
                .unreadCount(0L)
                .build();
        return conversationParticipantMapper.toResponse(conversationParticipantRepository.save(conversationParticipant));
    }

    @Override
    @Transactional
    public ConversationParticipantResponse leaveConversation(UUID conversationId) {
        UUID userId = userService.getMyInfo().getId();
        return remove(conversationId, userId);
    }

    @Override
    @Transactional
    public ConversationParticipantResponse removeParticipant(UUID conversationId, UUID participantId) {
        return remove(conversationId, participantId);
    }

    private ConversationParticipantResponse remove(UUID conversationId, UUID participantId) {
        ConversationParticipant conversationParticipant = conversationParticipantRepository.findById(
                ConversationParticipantId.builder()
                        .userId(participantId)
                        .conversationId(conversationId)
                        .build()
                )
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_PARTICIPANT_NOT_FOUND));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.getParticipants().remove(conversationParticipant);
        return conversationParticipantMapper.toResponse(conversationParticipant);
    }

    @Override
    @Transactional
    public void markAsRead(UUID conversationId, UUID participantId) {
        ConversationParticipant conversationParticipant = conversationParticipantRepository.findById(
                ConversationParticipantId.builder()
                        .userId(participantId)
                        .conversationId(conversationId)
                        .build()
        ).orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_PARTICIPANT_NOT_FOUND));
        conversationParticipant.setUnreadCount(0L);
        conversationParticipant.setLastReadAt(Instant.now());
        conversationParticipantRepository.save(conversationParticipant);
    }


    @Override
    public List<String> getParticipantEmails(UUID conversationId) {
        return conversationParticipantRepository.findUserEmailsByConversationId(conversationId);
    }
}
