package com.khangdev.elearningbe.service.ai;

import com.khangdev.elearningbe.dto.request.course.CourseEmbeddingDTO;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;

import java.util.List;
import java.util.UUID;

public interface CourseEmbeddingService {
    void embedCourse(CourseEmbeddingDTO courseEmbeddingDTO);
    void embedCourses(List<CourseEmbeddingDTO> courseEmbeddingDTOS);
    List<EmbeddingMatch<TextSegment>> searchSimilarCourses(
            String query,
            int maxResults,
            double minScore
    );
    void removeCourseEmbedding(UUID courseId);
    void updateCourseEmbedding(CourseEmbeddingDTO courseDTO);
    String buildCourseContext(List<EmbeddingMatch<TextSegment>> matches);
}
