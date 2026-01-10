package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.entity.course.CourseCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
    public class CourseCategoryRequest {
        private String name;
        private String description;
        private String iconUrl;
    }
