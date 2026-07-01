package com.khangdev.elearningbe.dto.request.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSectionRequest {
    private UUID courseId;
    private String title;
    private String description;
    private Integer displayOrder;
    private Integer durationMinutes = 0;
    private Boolean isPublished = true;
}
