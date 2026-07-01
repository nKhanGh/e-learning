package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.id.LectureProgressId;
import com.khangdev.elearningbe.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "lecture_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lecture_id"}),
        indexes = {
                @Index(name = "idx_user_lecture", columnList = "user_id, lecture_id"),
                @Index(name = "idx_lecture_completed", columnList = "lecture_id, completed"),
                @Index(name = "idx_last_watched", columnList = "last_watched_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureProgress extends BaseEntity {
    @EmbeddedId
    private LectureProgressId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    @MapsId("lectureId")
    private Lecture lecture;

    @Column(name = "completed", nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "last_watched_at")
    private Instant lastWatchedAt;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "bookmarked")
    @Builder.Default
    private Boolean bookmarked = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
