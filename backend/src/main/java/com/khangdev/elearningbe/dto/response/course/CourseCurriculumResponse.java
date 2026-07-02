package com.khangdev.elearningbe.dto.response.course;

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
public class CourseCurriculumResponse {
    private UUID courseId;
    private Integer totalSections;
    private Integer totalLectures;
    private Integer totalDurationMinutes;
    private List<SectionItem> sections;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionItem {
        private UUID id;
        private String title;
        private String description;
        private Integer displayOrder;
        private Integer durationMinutes;
        private List<LectureItem> lectures;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LectureItem {
        private UUID id;
        private String title;
        private String description;
        private ContentType contentType;
        private Integer displayOrder;
        private Integer durationMinutes;
        private Integer videoDurationSeconds;
        private Boolean preview;
        private Boolean downloadable;
        private Boolean completed;
        private String status;
        private QuizItem quiz;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizItem {
        private UUID id;
        private String title;
        private String description;
        private Integer timeLimitMinutes;
        private Integer totalQuestions;
        private Boolean completed;
        private String status;
    }
}

