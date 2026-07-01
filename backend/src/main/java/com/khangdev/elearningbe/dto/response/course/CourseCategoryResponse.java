package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.entity.course.CourseCategory;
import jakarta.persistence.*;
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
public class CourseCategoryResponse {
    UUID id;
    private String name;

    private String description;

    private CourseCategoryResponse parent;

    private List<CourseCategoryResponse> children = new ArrayList<>();

    private String iconUrl;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
