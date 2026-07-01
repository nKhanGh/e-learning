package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.interaction.Conversation;
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
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class MessageServiceTest {

    @Autowired
    private MessageService messageService;

    @MockBean
    private MessageRepository messageRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ConversationRepository conversationRepository;

    @MockBean
    private ConversationParticipantRepository conversationParticipantRepository;

    @MockBean
    private SimpMessagingTemplate simpMessagingTemplate;

    @MockBean
    private UserService userService;

    @MockBean
    private MessageMapper messageMapper;

    @Test
    void sendMessage_success() {
        UUID userId = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).email("user@example.com").build();
        Conversation conversation = Conversation.builder().id(conversationId).build();
        Message message = Message.builder().id(UUID.randomUUID()).content("hello").conversation(conversation)
                .sender(user).build();
        MessageResponse response = MessageResponse.builder().id(message.getId()).content("hello").build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(messageRepository.save(Mockito.any(Message.class))).thenReturn(message);
        Mockito.when(conversationParticipantRepository.findByConversationIdAndUserIdNot(conversationId, userId))
                .thenReturn(Collections.emptyList());
        Mockito.when(messageMapper.toResponse(ArgumentMatchers.any(Message.class))).thenReturn(response);

        MessageSendRequest request = MessageSendRequest.builder()
                .conversationId(conversationId)
                .content("hello")
                .build();

        MessageResponse result = messageService.sendMessage(request, user.getEmail());

        Assertions.assertThat(result.getContent()).isEqualTo("hello");
    }

    @Test
    void sendMessage_withParent_success() {
        UUID userId = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).email("user@example.com").build();
        Conversation conversation = Conversation.builder().id(conversationId).build();
        Message parent = Message.builder().id(parentId).build();
        Message message = Message.builder().id(UUID.randomUUID()).content("reply").conversation(conversation)
                .parent(parent).sender(user).build();
        MessageResponse response = MessageResponse.builder().id(message.getId()).content("reply").build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(messageRepository.findById(parentId)).thenReturn(Optional.of(parent));
        Mockito.when(messageRepository.save(ArgumentMatchers.any(Message.class))).thenReturn(message);
        Mockito.when(conversationParticipantRepository.findByConversationIdAndUserIdNot(conversationId, userId))
                .thenReturn(Collections.emptyList());
        Mockito.when(messageMapper.toResponse(ArgumentMatchers.any(Message.class))).thenReturn(response);

        MessageSendRequest request = MessageSendRequest.builder()
                .conversationId(conversationId)
                .parentId(parentId)
                .content("reply")
                .build();

        MessageResponse result = messageService.sendMessage(request, user.getEmail());

        Assertions.assertThat(result.getContent()).isEqualTo("reply");
    }

    @Test
    void sendMessage_parentNotFound_throwException() {
        UUID userId = UUID.randomUUID();
        UUID conversationId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).email("user@example.com").build();
        Conversation conversation = Conversation.builder().id(conversationId).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));
        Mockito.when(messageRepository.findById(parentId)).thenReturn(Optional.empty());

        MessageSendRequest request = MessageSendRequest.builder()
                .conversationId(conversationId)
                .parentId(parentId)
                .content("reply")
                .build();

        Assertions.assertThatThrownBy(() -> messageService.sendMessage(request, user.getEmail()))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.MESSAGE_NOT_FOUND);
    }
}
