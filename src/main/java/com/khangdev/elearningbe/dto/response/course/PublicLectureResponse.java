package com.khangdev.elearningbe.dto.response.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicLectureResponse {
    private UUID id;
    private CourseSectionResponse section;
    private String title;
    private String description;
    private Boolean isPublished;
    private QuizResponse quiz;
}
