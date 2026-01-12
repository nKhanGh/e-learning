package com.khangdev.elearningbe.dto.response.course;


import com.khangdev.elearningbe.entity.course.Course;
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
public class CourseSectionResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer displayOrder;
    private Integer durationMinutes = 0;
    private Boolean isPublished = true;
}
