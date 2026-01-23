package com.khangdev.elearningbe.entity.common;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReportReason;
import com.khangdev.elearningbe.enums.ReportStatus;
import com.khangdev.elearningbe.enums.ReportTargetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reports", indexes = {
        @Index(name = "idx_reporter_id", columnList = "reporter_id"),
        @Index(name = "idx_entity_type", columnList = "entity_type"),
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(name = "entity_type", nullable = false, length = 50)
    private ReportTargetType targetType; // COURSE, COMMENT

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportReason reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "moderator_notes", columnDefinition = "TEXT")
    private String moderatorNotes;
}
