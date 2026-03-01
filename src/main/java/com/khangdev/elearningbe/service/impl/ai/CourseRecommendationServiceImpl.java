package com.khangdev.elearningbe.service.impl.ai;

import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.service.ai.CourseEmbeddingService;
import com.khangdev.elearningbe.service.ai.CourseRecommendationService;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseRecommendationServiceImpl implements CourseRecommendationService {

    private final CourseEmbeddingService embeddingService;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;


    @Value("${app.ai.recommendation.top-k:5}")
    private Integer topK;

    @Value("${app.ai.recommendation.min-score:0.7}")
    private Double minScore;

    @Override
    public List<CourseRecommendationDTO> recommendByUserPreferences(UUID userId, String preferences) {
        try{
            List<EmbeddingMatch<TextSegment>> matches =
                    embeddingService.searchSimilarCourses(preferences, topK, minScore);
            return matches.stream()
                    .map(this::convertToRecommendationDTO)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e){
            log.error("Error recommending by preferences: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public List<CourseRecommendationDTO> recommendSimilarCourses(UUID courseId) {
        try{
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
            String query = buildCourseQuery(course);

            List<EmbeddingMatch<TextSegment>> matches = embeddingService.searchSimilarCourses(query, topK + 1, minScore);
            return matches.stream()
                    .filter(match -> !courseId.toString().equals(
                            match.embedded().metadata().getString("courseId")
                    ))
                    .map(this::convertToRecommendationDTO)
                    .filter(Objects::nonNull)
                    .toList();
        } catch(Exception e){
            log.error("Error converting match to recommendation: {}", e.getMessage());
            return List.of();
        }
    }

    private String buildCourseQuery(Course course){
        StringBuilder query = new StringBuilder();
        query.append(course.getTitle()).append(" .");
        query.append(course.getDescription()).append(" .");

        if(course.getCategory() != null){
            query.append("Danh mục: ").append(course.getCategory().getName()).append(" .");
        }

        if (course.getLevel() != null){
            query.append("Cấp độ: ").append(course.getLevel().name()).append(" .");
        }

        return query.toString();
    }

    @Override
    public List<CourseRecommendationDTO> recommendForBeginners(String topic) {
        String query = String.format(
                "Khóa học cơ bản cho người mới bắt đầu về %s, dễ hiểu, cấp độ beginner",
                topic
        );

        List<EmbeddingMatch<TextSegment>> matches =
                embeddingService.searchSimilarCourses(query, topK, 0.6);

        return matches.stream()
                .filter(match -> "BEGINNER".equalsIgnoreCase(
                        match.embedded().metadata().getString("level")
                ))
                .map(this::convertToRecommendationDTO)
                .filter(Objects::nonNull)
                .toList();
    }


    @Override
    public CourseRecommendationDTO getCourseRecommendation(UUID courseId, Double score) {
        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return null;
        }
        return convertToCourseRecommendationDTO(course, score);
    }

    private CourseRecommendationDTO convertToRecommendationDTO(EmbeddingMatch<TextSegment> match) {
        try{
            String courseIdStr = match.embedded().metadata().getString("courseId");
            UUID courseId = UUID.fromString(courseIdStr);

            Course course = courseRepository.findById(courseId).orElse(null);
            if(course == null) return null;

            return convertToCourseRecommendationDTO(course, match.score());
        } catch(Exception e){
            log.error("Error converting match to recommendation: {}", e.getMessage());
            return null;
        }
    }

    private CourseRecommendationDTO convertToCourseRecommendationDTO(
            Course course,
            Double similarityScore
    ) {
        String reason = generateReason(course, similarityScore);

        return CourseRecommendationDTO.builder()
                .courseId(course.getId())
                .similarityScore(similarityScore)
                .reason(reason)
                .build();
    }


    private String generateReason(Course course, Double similarityScore) {
        if (similarityScore == null) {
            return "Khóa học phù hợp với nhu cầu của bạn.";
        }

        if (similarityScore > 0.85) {
            return "Khóa học rất phù hợp với nhu cầu học tập của bạn.";
        } else if (similarityScore > 0.7) {
            return "Khóa học phù hợp với trình độ và mục tiêu của bạn.";
        } else {
            return "Khóa học có một số nội dung phù hợp với nhu cầu của bạn.";
        }
    }
}
