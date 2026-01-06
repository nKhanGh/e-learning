package com.khangdev.elearningbe.entity.interaction;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_is_read", columnList = "is_read"),
        @Index(name = "idx_type", columnList = "type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    UUID userId;

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    String content;

    UUID referenceId;

    NotificationType type;

    @Column(nullable = false)
    @Builder.Default
    Boolean isRead = false;

    Instant readAt;
}
