package com.khangdev.elearningbe.entity.common;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.id.BookmarkId;
import com.khangdev.elearningbe.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bookmarks",
        indexes = {
                @Index(name = "idx_enrollment_id", columnList = "enrollment_id"),
                @Index(name = "idx_lecture_id", columnList = "lecture_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bookmark extends BaseEntity {

    @EmbeddedId
    private BookmarkId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id")
    @MapsId("lectureId")
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

}
