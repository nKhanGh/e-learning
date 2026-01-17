package com.khangdev.elearningbe.entity.common;

import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.id.NoteId;
import com.khangdev.elearningbe.entity.user.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(
        name = "notes",
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_lecture_id", columnList = "lecture_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note extends BaseEntity {

    @EmbeddedId
    private NoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    @MapsId("lectureId")
    private Lecture lecture;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "video_timestamp_seconds")
    private Integer videoTimestampSeconds;
}

