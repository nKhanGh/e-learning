package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.enums.ContentType;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureRequest {
    private UUID sectionId;
    private String title;
    private String description;
    private ContentType contentType;
    private String textContent;
    @Nullable
    private String videoUrl;
    @Nullable
    private Integer videoDurationSeconds = 0;
    @Nullable
    private String videoThumbnailUrl;
    @Nullable
    private String videoQuality;
    private Boolean hasCaptions = false;
    @Nullable
    private String captionUrl;
    @Nullable
    private List<String> attachments;
    @Nullable
    private String externalUrl;
    private Boolean isPreview = false;
    private Boolean isDownloadable = false;
    private Boolean isPublished = true;
}
