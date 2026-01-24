package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.interaction.ConversationCreationRequest;
import com.khangdev.elearningbe.dto.response.interaction.ConversationResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ConversationMapper;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.ConversationService;
import com.khangdev.elearningbe.service.FileService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    private final UserService userService;
    private final FileService fileService;

    private final ConversationMapper conversationMapper;

    @Override
    public List<ConversationResponse> getMyConversations() {
        UUID userId = userService.getMyInfo().getId();
        return conversationRepository.findByUserId(userId)
                .stream().map(conversationMapper::toResponse).toList();
    }

    @Override
    public List<ConversationResponse> searchConversations(String keyword, boolean isGroup) {
        UserResponse currentUser = userService.getMyInfo();

        if(isGroup) {
            return conversationRepository.searchByNameLike(keyword, currentUser.getEmail())
                    .stream().map(conversationMapper::toResponse).toList();
        } else {
            List<UUID> userIds = userRepository.searchUser(keyword, currentUser.getEmail())
                    .stream().map(User::getId).toList();
            if(userIds.isEmpty()) {
                return List.of();
            }
            return conversationRepository.findDirectConversationsWithUsers(currentUser.getId(), userIds)
                    .stream().map(conversationMapper::toResponse).toList();
        }
    }

    @Override
    @Transactional
    public ConversationResponse createConversation(ConversationCreationRequest request, MultipartFile avatarFile) throws IOException {
        String fileName = null;
        if (avatarFile != null && !avatarFile.isEmpty()) {
            fileName = fileService.uploadAvatar(avatarFile);
        }


        Conversation conversation = Conversation.builder()
                .isGroup(request.getIsGroup())
                .name(request.getName())
                .description(request.getDescription())
                .avatarFileName(fileName)
                .build();

        UUID myId = userService.getMyInfo().getId();


        List<UUID> participantIds = request.getParticipantIds().stream().distinct().toList();;
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

        List<ConversationParticipant> participants = users.stream().map(
                u -> ConversationParticipant.builder()
                        .user(u)
                        .nickname(null)
                        .lastReadAt(Instant.now())
                        .conversation(conversation)
                        .build()
        ).toList();
        conversation.setParticipants(participants);
        return conversationMapper.toResponse(conversationRepository.save(conversation));
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
        return conversationMapper.toResponse(conversation);
    }

    @Override
    @Transactional
    public ConversationResponse rename(UUID conversationId, String newName) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        conversation.setName(newName);
        return conversationMapper.toResponse(conversationRepository.save(conversation));
    }

    @Override
    public void deleteConversation(Conversation conversation) {
        conversationRepository.delete(conversation);
    }
}
