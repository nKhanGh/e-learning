package com.khangdev.elearningbe.dto.response.course;

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
public class CoursePublishChecklistResponse {
    private UUID courseId;
    private Boolean ready;
    private List<Group> groups;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {
        private String key;
        private String label;
        private List<Item> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String key;
        private String status;
        private String message;
        private String targetType;
        private UUID targetId;
    }
}
