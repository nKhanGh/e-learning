package com.khangdev.elearningbe.service.impl.interaction;

import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.entity.id.MessageReactionId;
import com.khangdev.elearningbe.entity.interaction.Message;
import com.khangdev.elearningbe.entity.interaction.MessageReaction;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReactionType;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.MessageReactionMapper;
import com.khangdev.elearningbe.repository.MessageReactionRepository;
import com.khangdev.elearningbe.repository.MessageRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.MessageReactionService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageReactionServiceImpl implements MessageReactionService {
    private final MessageReactionRepository  messageReactionRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    private final UserService userService;

    private final MessageReactionMapper messageReactionMapper;


    @Override
    @Transactional
    public MessageReactionResponse react(UUID messageId, ReactionType reaction) {
        UUID userId = userService.getMyInfo().getId();

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        MessageReactionId id = MessageReactionId.builder()
                .messageId(messageId)
                .userId(userId)
                .build();

        MessageReaction messageReaction = messageReactionRepository.findById(id)
                .orElseGet(() -> MessageReaction.builder()
                        .id(id)
                        .message(message)
                        .user(user)
                        .build()
                );

        messageReaction.setReaction(reaction);

        return messageReactionMapper.toResponse(messageReactionRepository.save(messageReaction));
    }

    @Override
    public List<MessageReactionResponse> getReactions(UUID messageId) {
        return messageReactionRepository.findByMessageId(messageId)
                .stream().map(messageReactionMapper::toResponse).toList();
    }
}
