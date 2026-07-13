package com.khangdev.elearningbe.dto.response.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseReviewDetailResponse {
    private CourseResponse course;
    private CoursePublishChecklistResponse checklist;
    private CourseCurriculumResponse curriculum;
    private List<CourseReviewHistoryResponse> reviewHistory;
}
