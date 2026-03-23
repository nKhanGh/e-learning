package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.document.CourseDocument;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseTag;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CourseDocumentMapper {
    public CourseDocument toDocument(Course course) {
        return CourseDocument.builder()
                .id(course.getId().toString())
                .title(course.getTitle())
                .titleKeyword(course.getTitle())
                .description(course.getDescription())
                .slug(course.getSlug())
                .thumbnailUrl(course.getThumbnailUrl())

                // Category
                .categoryId(course.getCategory() != null
                        ? course.getCategory().getId().toString() : null)
                .categoryName(course.getCategory() != null
                        ? course.getCategory().getName() : null)

                // Instructor
                .instructorId(course.getInstructor() != null
                        ? course.getInstructor().getId().toString() : null)
                .instructorName(course.getInstructor() != null
                        ? course.getInstructor().getUser().getFirstName() + " " + course.getInstructor().getUser().getLastName()  : null)

                // Metadata
                .level(course.getLevel())
                .language(course.getLanguage())
                .status(course.getStatus())
                .isFree(course.getIsFree())
                .hasQuizzes(course.getHasQuizzes())
                .hasCertificate(course.getHasCertificate())
                .isFeatured(course.getIsFeatured())
                .isBestseller(course.getIsBestseller())

                // Pricing
                .price(course.getPrice())
                .originalPrice(course.getOriginalPrice())

                // Stats (denormalized từ entity)
                .averageRating(course.getAverageRating())
                .totalEnrollments(course.getTotalEnrollments())
                .totalReviews(course.getTotalReviews())
                .totalStudents(course.getTotalStudents())
                .durationMinutes(course.getDurationMinutes())
                .totalLectures(course.getTotalLectures())

                // Tags: List<CourseTag> → List<String>
                .tagNames(extractTagNames(course.getTags()))

                // Timestamps
                .publishedAt(course.getPublishedAt())
                .updatedAt(course.getUpdatedAt())

                // popularityScore: null — BackgroundJob update sau
                .popularityScore(null)
                .build();
    }

    public CourseDocument toStatsUpdate(Course course) {
        return CourseDocument.builder()
                .id(course.getId().toString())
                .averageRating(course.getAverageRating())
                .totalEnrollments(course.getTotalEnrollments())
                .totalReviews(course.getTotalReviews())
                .totalStudents(course.getTotalStudents())
                .build();
    }

    private List<String> extractTagNames(List<CourseTag> tags) {
        if (tags == null || tags.isEmpty()) return List.of();
        return tags.stream()
                .map(CourseTag::getName)
                .collect(Collectors.toList());
    }
}
