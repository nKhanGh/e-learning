package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureResponse {
    private UUID id;
    private CourseSectionResponse section;
    private String title;
    private String description;
    private ContentType contentType;
    private String textContent;
    private String videoUrl;
    private Integer videoDurationSeconds;
    private String videoThumbnailUrl;
    private String videoQuality;
    private Boolean hasCaptions;
    private String captionUrl;
    private String attachments;
    private String externalUrl;
    private Boolean isPreview ;
    private Boolean isDownloadable;
    private Integer displayOrder;
    private Boolean isPublished;
    private QuizResponse quiz;
}
