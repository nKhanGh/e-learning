package com.khangdev.elearningbe.service.impl.ai;

import com.khangdev.elearningbe.dto.request.course.CourseEmbeddingDTO;
import com.khangdev.elearningbe.service.ai.CourseEmbeddingService;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseEmbeddingServiceImpl implements CourseEmbeddingService {
    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    @Override
    public void embedCourse(CourseEmbeddingDTO courseEmbeddingDTO) {
        try{
            String text = courseEmbeddingDTO.toEmbeddingText();

            Metadata metadata = Metadata.from("courseId", courseEmbeddingDTO.getCourseId().toString())
                    .put("title", courseEmbeddingDTO.getTitle())
                    .put("categoryName", courseEmbeddingDTO.getCategoryName())
                    .put("level", courseEmbeddingDTO.getLevel().name())
                    .put("averageRating", courseEmbeddingDTO.getAverageRating().toString())
                    .put("totalStudents", courseEmbeddingDTO.getTotalStudents().toString());

            TextSegment segment = TextSegment.from(text, metadata);

            Embedding embedding = embeddingModel.embed(segment).content();

            removeCourseEmbedding(courseEmbeddingDTO.getCourseId());

            embeddingStore.add(embedding, segment);
            log.info("Embedded course: {}", courseEmbeddingDTO.getTitle());
        } catch (Exception e) {
            log.error("Error embedding course {}: {}", courseEmbeddingDTO.getCourseId(), e.getMessage());
            throw new RuntimeException("Failed to embed course", e);
        }
    }

    @Override
    public void embedCourses(List<CourseEmbeddingDTO> courseEmbeddingDTOS) {
        courseEmbeddingDTOS.forEach(this::embedCourse);
    }

    @Override
    public List<EmbeddingMatch<TextSegment>> searchSimilarCourses(String query, int maxResults, double minScore) {
        try{
            Embedding embedding = embeddingModel.embed(query).content();

            EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                    .queryEmbedding(embedding)
                    .maxResults(maxResults)
                    .minScore(minScore)
                    .build();

            EmbeddingSearchResult<TextSegment> result = embeddingStore.search(searchRequest);

            return result.matches();

        } catch (Exception e) {
            log.error("Error searching similar courses: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public void removeCourseEmbedding(UUID courseId) {
        try{
            // NOTE: PgVectorEmbeddingStore does not support delete by metadata.
            // This remove operation may not physically delete the embedding.
            embeddingStore.remove(courseId.toString());
            log.info("Removed course: {}", courseId);
        } catch (Exception e) {
            log.error("Error removing course: {} ({})", courseId.toString(), e.getMessage());
        }
    }

    @Override
    public void updateCourseEmbedding(CourseEmbeddingDTO courseDTO) {
        removeCourseEmbedding(courseDTO.getCourseId());
        embedCourse(courseDTO);
    }

    @Override
    public String buildCourseContext(List<EmbeddingMatch<TextSegment>> matches) {
        if (matches.isEmpty()) {
            return "Không tìm thấy khóa học phù hợp.";
        }

        StringBuilder context = new StringBuilder("Thông tin các khóa học liên quan:\n\n");

        // Limit context size to avoid token overflow
        int limit = Math.min(matches.size(), 3);

        for (int i = 0; i < limit; i++) {
            EmbeddingMatch<TextSegment> match = matches.get(i);
            TextSegment segment = match.embedded();
            Metadata metadata = segment.metadata();

            context.append(String.format("%d. %s\n", i + 1, metadata.getString("title")));
            context.append(String.format("   Cấp độ: %s\n", metadata.getString("level")));
            context.append(String.format("   Danh mục: %s\n", metadata.getString("categoryName")));
            context.append(String.format("   Đánh giá: %s/5\n", metadata.getString("averageRating")));
            context.append(String.format("   Học viên: %s\n", metadata.getString("totalStudents")));
            context.append(String.format("   Similarity: %.2f\n", match.score()));
            context.append("\n");
        }

        return context.toString();
    }
}
