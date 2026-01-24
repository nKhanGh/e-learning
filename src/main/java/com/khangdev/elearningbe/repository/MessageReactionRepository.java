package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.id.MessageReactionId;
import com.khangdev.elearningbe.entity.interaction.MessageReaction;
import com.khangdev.elearningbe.enums.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, MessageReactionId> {
    List<MessageReaction> findByMessageIdAndStatus(UUID message_id, DeliveryStatus status);
    List<MessageReaction> findByMessageId(UUID messageId);
}
