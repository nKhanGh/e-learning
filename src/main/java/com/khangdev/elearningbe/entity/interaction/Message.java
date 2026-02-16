package com.khangdev.elearningbe.entity.interaction;
import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.MessageSenderType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    Conversation conversation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    Message parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    String content;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, name = "sender_type")
    MessageSenderType senderType = MessageSenderType.USER;
}
