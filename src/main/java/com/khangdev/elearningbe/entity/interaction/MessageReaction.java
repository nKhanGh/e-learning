package com.khangdev.elearningbe.entity.interaction;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.id.MessageReactionId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "message_reaction")
public class MessageReaction extends BaseEntity {
    @EmbeddedId
    private MessageReactionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("messageId")
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "reaction")
    private ReactionType reaction;

}
