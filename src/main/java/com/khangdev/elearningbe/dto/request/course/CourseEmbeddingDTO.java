package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.enums.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEmbeddingDTO {
    private UUID courseId;
    private String title;
    private String description;
    private String categoryName;
    private List<String> whatYouWillLearn;
    private List<String> tags;
    private BigDecimal averageRating;
    private Integer totalStudents;
    private CourseLevel level;

    public String toEmbeddingText() {
        StringBuilder sb = new StringBuilder();
        sb.append("Tiêu đề: ").append(title).append(". ");
        sb.append("Mô tả: ").append(description).append(". ");
        sb.append("Danh mục: ").append(categoryName).append(". ");
        sb.append("Cấp độ: ").append(level).append(". ");

        if (whatYouWillLearn != null && !whatYouWillLearn.isEmpty()) {
            sb.append("Bạn sẽ học: ").append(String.join(", ", whatYouWillLearn)).append(". ");
        }

        if (tags != null && !tags.isEmpty()) {
            sb.append("Tags: ").append(String.join(", ", tags)).append(".");
        }

        return sb.toString();
    }
}
