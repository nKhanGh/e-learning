package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.enums.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSearchRequest {
    String keyword;
    List<UUID> categoryId;
    CourseLevel level;
    Double minPrice;
    Double maxPrice;
    Double minAverageRating;
    Double maxAverageRating;
    Boolean isFree;
    Boolean hasQuiz;
    List<String> tagNames;
}
