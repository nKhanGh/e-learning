package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.id.MessageReactionId;
import com.khangdev.elearningbe.entity.interaction.Message;
import com.khangdev.elearningbe.entity.interaction.MessageReaction;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReactionType;
import com.khangdev.elearningbe.mapper.MessageReactionMapper;
import com.khangdev.elearningbe.repository.MessageReactionRepository;
import com.khangdev.elearningbe.repository.MessageRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.MessageReactionService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.UUID;

@SpringBootTest
public class MessageReactionServiceTest {

    @Autowired
    private MessageReactionService messageReactionService;

    @MockBean
    private MessageReactionRepository messageReactionRepository;

    @MockBean
    private MessageRepository messageRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserService userService;

    @MockBean
    private MessageReactionMapper messageReactionMapper;

    @Test
    void getReactions_success() {
        UUID messageId = UUID.randomUUID();
        MessageReaction reaction = MessageReaction.builder().build();
        MessageReactionResponse response = MessageReactionResponse.builder().build();

        Mockito.when(messageReactionRepository.findByMessageId(messageId))
                .thenReturn(List.of(reaction));
        Mockito.when(messageReactionMapper.toResponse(reaction)).thenReturn(response);

        List<MessageReactionResponse> result = messageReactionService.getReactions(messageId);

        Assertions.assertThat(result).hasSize(1);
    }

    @Test
    void react_success() {
        UUID messageId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        Message message = Message.builder().id(messageId).build();
        User user = User.builder().id(userId).build();
        MessageReaction reaction = MessageReaction.builder()
                .id(MessageReactionId.builder().messageId(messageId).userId(userId).build())
                .message(message)
                .user(user)
                .reaction(ReactionType.LIKE)
                .build();
        MessageReactionResponse response = MessageReactionResponse.builder().build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(messageRepository.findById(messageId)).thenReturn(java.util.Optional.of(message));
        Mockito.when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));
        Mockito.when(messageReactionRepository.findById(ArgumentMatchers.any(MessageReactionId.class)))
                .thenReturn(java.util.Optional.of(reaction));
        Mockito.when(messageReactionRepository.save(ArgumentMatchers.any(MessageReaction.class)))
                .thenReturn(reaction);
        Mockito.when(messageReactionMapper.toResponse(reaction)).thenReturn(response);

        MessageReactionResponse result = messageReactionService.react(messageId, ReactionType.LIKE);

        Assertions.assertThat(result).isNotNull();
    }
}