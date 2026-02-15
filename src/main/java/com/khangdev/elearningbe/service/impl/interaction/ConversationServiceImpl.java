package com.khangdev.elearningbe.service.impl.interaction;

import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.ConversationParticipantId;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import com.khangdev.elearningbe.entity.interaction.Message;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ConversationMapper;
import com.khangdev.elearningbe.mapper.ConversationParticipantMapper;
import com.khangdev.elearningbe.mapper.MessageMapper;
import com.khangdev.elearningbe.repository.ConversationParticipantRepository;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.MessageRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.ConversationService;
import com.khangdev.elearningbe.service.common.FileService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationServiceImpl implements ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final MessageRepository  messageRepository;
    private final UserRepository userRepository;

    private final UserService userService;
    private final FileService fileService;

    private final ConversationMapper conversationMapper;
    private final ConversationParticipantMapper conversationParticipantMapper;
    private final MessageMapper messageMapper;

    private ConversationResponse setConversationAttr(ConversationResponse response) {
        UserResponse currentUser = userService.getMyInfo();
        ConversationParticipant conversationParticipant = conversationParticipantRepository
                .findByConversationIdAndUserId(response.getId(), currentUser.getId());

        response.setMyParticipant(conversationParticipantMapper.toResponse(conversationParticipant));
        var lastMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(response.getId());
        lastMessage.ifPresent(message -> response.setLastMessage(messageMapper.toResponse(message)));

        return response;
    }

    @Override
    @Transactional
    public ConversationResponse createAIConversation() {
        UUID userId = userService.getMyInfo().getId();
        var oldConversation = conversationRepository.findAiConversationByUserId(userId);
        if(oldConversation.isPresent()){
            return conversationMapper.toResponse(oldConversation.get());
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Conversation conversation = Conversation.builder()
                .description("Your chat with AI")
                .isGroup(false)
                .name("Sofia")
                .isAi(true)
                .build();

        conversationRepository.save(conversation);

        ConversationParticipant conversationParticipant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder()
                        .userId(userId)
                        .conversationId(conversation.getId())
                        .build())
                .conversation(conversation)
                .user(user)
                .nickname(null)
                .lastReadAt(Instant.now())
                .unreadCount(0L)
                .build();

        conversation.setParticipants(List.of(conversationParticipant));
        ConversationResponse response =  conversationMapper.toResponse(conversation);
        return setConversationAttr(response);

    }

    @Override
    public List<ConversationResponse> getMyConversations() {
        UUID userId = userService.getMyInfo().getId();
        return conversationRepository.findByUserId(userId)
                .stream()
                .map(conversation -> {
                    ConversationResponse response =
                            conversationMapper.toResponse(conversation);
                    return setConversationAttr(response);
                })
                .toList();
    }

    @Override
    public List<ConversationResponse> searchConversations(String keyword, boolean isGroup) {
        UserResponse currentUser = userService.getMyInfo();

        if(isGroup) {
            return conversationRepository.searchByNameLike(keyword, currentUser.getEmail())
                    .stream().map(conversation -> {
                        ConversationResponse response =
                                conversationMapper.toResponse(conversation);
                        return setConversationAttr(response);
                    })
                    .toList();
        } else {
            List<UUID> userIds = userRepository.searchUser(keyword, currentUser.getEmail())
                    .stream().map(User::getId).toList();
            if(userIds.isEmpty()) {
                return List.of();
            }
            return conversationRepository.findDirectConversationsWithUsers(currentUser.getId(), userIds)
                    .stream().map(conversation -> {
                        ConversationResponse response =
                                conversationMapper.toResponse(conversation);

                        return setConversationAttr(response);
                    }).toList();
        }
    }

    @Override
    @Transactional
    public ConversationResponse createConversation(ConversationCreationRequest request, MultipartFile avatarFile) throws IOException {

        UUID myId = userService.getMyInfo().getId();

        List<UUID> participantIds = new java.util.ArrayList<>(request.getParticipantIds().stream().distinct().toList());;
        if(!participantIds.contains(myId)) {
            participantIds.add(myId);
        }

        if (!request.getIsGroup() && participantIds.size() != 2) {
            throw new AppException(ErrorCode.INVALID_DIRECT_CONVERSATION);
        }

        if (!request.getIsGroup()) {
            UUID otherId = participantIds.stream().filter(id -> !id.equals(myId)).findFirst().get();
            conversationRepository.findDirectConversation(myId, otherId)
                    .ifPresent(c -> { throw new AppException(ErrorCode.DIRECT_CONVERSATION_ALREADY_EXISTS); });
        }


        List<User> users = userRepository.findAllById(participantIds);

        if (users.size() != participantIds.size()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }


        Conversation conversation = Conversation.builder()
                .isGroup(request.getIsGroup())
                .name(request.getName())
                .description(request.getDescription())
                .build();

        conversationRepository.save(conversation);
        List<ConversationParticipant> participants = users.stream().map(
                u -> ConversationParticipant.builder()
                        .id(ConversationParticipantId.builder()
                                .userId(u.getId())
                                .conversationId(conversation.getId())
                                .build())
                        .user(u)
                        .nickname(null)
                        .lastReadAt(Instant.now())
                        .conversation(conversation)
                        .build()
        ).toList();
        conversation.setParticipants(participants);
        String fileName = null;
        if (avatarFile != null && !avatarFile.isEmpty()) {
            fileName = fileService.uploadAvatar(avatarFile);
        }

        conversation.setAvatarFileName(fileName);

        ConversationResponse response = conversationMapper.toResponse(conversation);
        return setConversationAttr(response);
    }

    @Override
    @Transactional
    public ConversationResponse changeAvatar(UUID conversationId, MultipartFile avatarFile) throws IOException {
        Conversation conversation =  conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        String fileName = null;
        if (avatarFile != null && !avatarFile.isEmpty()) {
            fileName = fileService.uploadAvatar(avatarFile);
        }
        if(fileName != null) {
            conversation.setAvatarFileName(fileName);
            conversationRepository.save(conversation);
        }
        ConversationResponse response = conversationMapper.toResponse(conversation);
        return setConversationAttr(response);
    }

    @Override
    @Transactional
    public ConversationResponse rename(UUID conversationId, String newName) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        conversation.setName(newName);
        ConversationResponse response = conversationMapper.toResponse(conversationRepository.save(conversation));
        return setConversationAttr(response);
    }

    @Override
    public void deleteConversation(UUID conversationId) {
        conversationRepository.deleteById(conversationId);
    }
}
