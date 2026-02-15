package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.id.ConversationParticipantId;
import com.khangdev.elearningbe.entity.interaction.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, ConversationParticipantId> {
    @Modifying
    @Query("""
        update ConversationParticipant cp
        set cp.unreadCount = coalesce(cp.unreadCount, 0) + 1
        where cp.conversation.id = :conversationId
          and cp.user.id <> :senderId
    """)
    void increaseUnreadForOthers(UUID conversationId, UUID senderId);

    ConversationParticipant findByConversationIdAndUserId(UUID conversationId, UUID senderId);

    List<ConversationParticipant> findByConversationIdAndUserIdNot(UUID conversationId, UUID userId);

}
