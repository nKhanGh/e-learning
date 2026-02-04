package com.khangdev.elearningbe.dto.request.course;

import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.enums.CourseLevel;
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
public class CourseEmbeddingDTO {
    private UUID courseId;
    private String title;
    private String description;
    private String categoryName;
    private List<String> whatYouWillLearn;
    private List<String> requirements;
    private List<String> targetAudience;
    private CourseLevel level;

    public String toEmbeddingText() {
        StringBuilder sb = new StringBuilder();

        append(sb, "title", title);
        append(sb, "description", description);
        append(sb, "categoryName", categoryName);
        appendList(sb, "whatYouWillLearn", whatYouWillLearn);
        appendList(sb, "requirements", requirements);
        appendList(sb, "targetAudience", targetAudience);
        append(sb, "level", level != null ? level.name() : null);

        return sb.toString();

    }

    private void append(StringBuilder sb, String label, String value){
        if(value != null && !value.isBlank()){
            sb.append(label).append(":\n")
                    .append(value).append("\n\n");
        }
    }

    private void appendList(StringBuilder sb, String label, List<String> value){
        if(value != null && !value.isEmpty()){
            sb.append(label).append(":\n");
            value.forEach(v -> sb.append("- ").append(v).append("\n"));
            sb.append("\n");
        }
    }
}
