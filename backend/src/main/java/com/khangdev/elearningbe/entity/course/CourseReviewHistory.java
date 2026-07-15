package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.CourseReviewAction;
import com.khangdev.elearningbe.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_review_history", indexes = {
        @Index(name = "idx_course_review_course_id", columnList = "course_id"),
        @Index(name = "idx_course_review_reviewer_id", columnList = "reviewer_id"),
        @Index(name = "idx_course_review_action", columnList = "action")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseReviewHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourseReviewAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private CourseStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private CourseStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String reason;
}
