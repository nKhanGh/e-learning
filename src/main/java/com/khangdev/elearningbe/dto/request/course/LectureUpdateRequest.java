package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.enums.ContentType;
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
public class LectureUpdateRequest {
    private String title;
    private String description;
    private ContentType contentType;
    private String textContent;
    private String videoUrl;
    private Integer videoDurationSeconds;
    private String videoThumbnailUrl;
    private String videoQuality;
    private Boolean hasCaptions = false;
    private String captionUrl;
    private List<String> attachments;
    private String externalUrl;
    private Boolean isPreview = false;
    private Boolean isDownloadable = false;
    private Integer displayOrder;
    private Boolean isPublished = true;
}
