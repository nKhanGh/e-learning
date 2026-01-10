package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.entity.course.Course;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseTagResponse {
    UUID id;
    private String name;
    private String slug;
    private Integer usageCount = 0;
}
