package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.interaction.ConversationParticipantResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
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
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class ConversationParticipantServiceTest {

    @Autowired
    private ConversationParticipantService conversationParticipantService;

    @MockBean
    private ConversationParticipantRepository conversationParticipantRepository;

    @MockBean
    private ConversationRepository conversationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private ConversationParticipantMapper conversationParticipantMapper;

    @Test
    void joinConversation_success() {
        UUID conversationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).email("user@example.com").build();
        User user = User.builder().id(userId).email("user@example.com").build();
        Conversation conversation = Conversation.builder().id(conversationId).build();
        ConversationParticipant participant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder().userId(userId).conversationId(conversationId).build())
                .user(user)
                .conversation(conversation)
                .build();
        ConversationParticipantResponse response = ConversationParticipantResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(conversationParticipantRepository.save(ArgumentMatchers.any(ConversationParticipant.class)))
                .thenReturn(participant);
        Mockito.when(conversationParticipantMapper.toResponse(participant)).thenReturn(response);

        ConversationParticipantResponse result = conversationParticipantService.joinConversation(conversationId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void leaveConversation_notFound_throwException() {
        UUID conversationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(conversationParticipantRepository.findById(ArgumentMatchers.any(ConversationParticipantId.class)))
                .thenReturn(Optional.empty());

        Assertions.assertThatThrownBy(() -> conversationParticipantService.leaveConversation(conversationId))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.CONVERSATION_PARTICIPANT_NOT_FOUND);
    }

    @Test
    void addParticipant_success() {
        UUID conversationId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        User user = User.builder().id(participantId).build();
        Conversation conversation = Conversation.builder().id(conversationId).build();
        ConversationParticipant participant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder().userId(participantId).conversationId(conversationId).build())
                .user(user)
                .conversation(conversation)
                .build();
        ConversationParticipantResponse response = ConversationParticipantResponse.builder().build();

        Mockito.when(userRepository.findById(participantId)).thenReturn(Optional.of(user));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(conversationParticipantRepository.save(ArgumentMatchers.any(ConversationParticipant.class)))
                .thenReturn(participant);
        Mockito.when(conversationParticipantMapper.toResponse(participant)).thenReturn(response);

        ConversationParticipantResponse result = conversationParticipantService.addParticipant(conversationId,
                participantId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void removeParticipant_success() {
        UUID conversationId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        ConversationParticipant participant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder().userId(participantId).conversationId(conversationId).build())
                .build();
        Conversation conversation = Conversation.builder().id(conversationId)
                .participants(new java.util.ArrayList<>(java.util.List.of(participant))).build();

        Mockito.when(conversationParticipantRepository.findById(ArgumentMatchers.any(ConversationParticipantId.class)))
                .thenReturn(Optional.of(participant));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(conversationParticipantMapper.toResponse(participant))
                .thenReturn(ConversationParticipantResponse.builder().build());

        ConversationParticipantResponse result = conversationParticipantService.removeParticipant(conversationId,
                participantId);

        Assertions.assertThat(result).isNotNull();
    }

    @Test
    void markAsRead_success() {
        UUID conversationId = UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        ConversationParticipant participant = ConversationParticipant.builder()
                .id(ConversationParticipantId.builder().userId(participantId).conversationId(conversationId).build())
                .build();

        Mockito.when(conversationParticipantRepository.findById(ArgumentMatchers.any(ConversationParticipantId.class)))
                .thenReturn(Optional.of(participant));

        conversationParticipantService.markAsRead(conversationId, participantId);

        Mockito.verify(conversationParticipantRepository).save(participant);
    }
}
