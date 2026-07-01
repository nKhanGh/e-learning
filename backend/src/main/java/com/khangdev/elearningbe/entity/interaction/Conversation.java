package com.khangdev.elearningbe.entity.interaction;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "is_group")
    private Boolean isGroup = false;

    @OneToMany(
            mappedBy = "conversation",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ConversationParticipant> participants;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "avatar_file_name")
    private String avatarFileName;

    @OneToMany(
            mappedBy = "conversation",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Message> messages;

    @Column(name = "is_ai")
    @Builder.Default
    private boolean isAi = false;

}
