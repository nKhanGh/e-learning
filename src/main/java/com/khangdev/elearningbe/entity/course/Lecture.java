package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.converter.StringListJsonConverter;
import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.enums.ContentType;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lectures", indexes = {
        @Index(name = "idx_section_id", columnList = "section_id"),
        @Index(name = "idx_display_order", columnList = "section_id, display_order"),
        @Index(name = "idx_content_type", columnList = "content_type"),
        @Index(name = "idx_is_preview", columnList = "is_preview")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecture extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private CourseSection section;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 20)
    private ContentType contentType;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    // Video specific
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "video_duration_seconds")
    private Integer videoDurationSeconds;

    @Column(name = "video_thumbnail_url", length = 500)
    private String videoThumbnailUrl;

    @Column(name = "video_quality", length = 20)
    private String videoQuality;

    @Column(name = "has_captions")
    @Builder.Default
    private Boolean hasCaptions = false;

    @Column(name = "caption_url", length = 500)
    private String captionUrl;

    // File attachments
    @Convert(converter = StringListJsonConverter.class)
    @Column(columnDefinition = "JSON")
    private List<String> attachments; // JSON array

    // External resources
    @Column(name = "external_url", length = 500)
    private String externalUrl;

    // Settings
    @Column(name = "is_preview")
    @Builder.Default
    private Boolean isPreview = false;

    @Column(name = "is_downloadable")
    @Builder.Default
    private Boolean isDownloadable = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", unique = true)
    private Quiz quiz;

}
