package com.khangdev.elearningbe.entity.course;


import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.enums.CourseLevel;
import com.khangdev.elearningbe.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_instructor_id", columnList = "instructor_id"),
        @Index(name = "idx_category_id", columnList = "category_id"),
        @Index(name = "idx_slug", columnList = "slug"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_is_featured", columnList = "is_featured"),
        @Index(name = "idx_average_rating", columnList = "average_rating"),
        @Index(name = "idx_price", columnList = "price")
})

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE courses SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Course extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CourseCategory category;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false, length = 100)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "what_you_will_learn", columnDefinition = "JSON")
    private List<String> whatYouWillLearn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> requirements;


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON", name = "target_audience")
    private List<String> targetAudience; // JSON array

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "promotional_video_url", length = 500)
    private String promotionalVideoUrl;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(length = 3)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "is_free")
    @Builder.Default
    private Boolean isFree = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CourseLevel level;

    @Column(length = 10)
    @Builder.Default
    private String language = "en";

    @Column(name = "has_captions")
    @Builder.Default
    private Boolean hasCaptions = false;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "last_updated_content")
    private Instant lastUpdatedContent;

    @Column(name = "has_certificate")
    @Builder.Default
    private Boolean hasCertificate = true;

    @Column(name = "has_quizzes")
    @Builder.Default
    private Boolean hasQuizzes = false;

    // SEO
    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta_keywords", columnDefinition = "JSON")
    private List<String> metaKeywords;

    // Statistics (denormalized)
    @Column(name = "total_enrollments")
    @Builder.Default
    private Integer totalEnrollments = 0;

    @Column(name = "total_students")
    @Builder.Default
    private Integer totalStudents = 0;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_lectures")
    @Builder.Default
    private Integer totalLectures = 0;

    @Column(name = "total_sections")
    @Builder.Default
    private Integer totalSections = 0;

    @Column(name = "total_video_length_minutes")
    @Builder.Default
    private Integer totalVideoLengthMinutes = 0;


    // Flags
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_bestseller")
    @Builder.Default
    private Boolean isBestseller = false;

    @Column(name = "is_new")
    @Builder.Default
    private Boolean isNew = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_tag_map",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<CourseTag> tags = new ArrayList<>();


}
