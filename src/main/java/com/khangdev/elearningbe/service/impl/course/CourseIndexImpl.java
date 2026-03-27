package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.document.CourseDocument;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseDocumentMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.service.course.CourseIndex;
import com.khangdev.elearningbe.service.course.CourseSearchCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.IndexQueryBuilder;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseIndexImpl implements CourseIndex {

    private final ElasticsearchOperations esOps;
    private final CourseDocumentMapper mapper;
    private final CourseRepository courseRepo;
    private final CourseSearchCacheService cacheService;

    private static final String INDEX = "courses";
    private static final int    BATCH = 100;

    /**
     * Lắng nghe event khi course được publish / update nội dung.
     * Payload: courseId (UUID string)
     */
    @KafkaListener(
            topics   = "course.published",
            groupId  = "search-indexer",
            containerFactory = "ackKafkaListenerContainerFactory"
    )
    @Override
    public void onCoursePublished(String courseId, Acknowledgment ack) {
        log.info("Indexing published course: {}", courseId);
        try {
            indexOneCourse(courseId);
            cacheService.invalidateAll();   // cache cũ có thể thiếu course mới
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to index course {}: {}", courseId, e.getMessage(), e);
            // Không ack → Kafka redeliver (tối đa 3 lần, sau đó vào DLQ)
        }

    }


    /**
     * Khi chỉ stats thay đổi (enrollment, review, rating) — partial update.
     * Chỉ ghi lại các field stats, không đụng đến title/description.
     */
    @KafkaListener(
            topics   = "course.stats.updated",
            groupId  = "search-indexer",
            containerFactory = "ackKafkaListenerContainerFactory"
    )
    @Override
    public void onCourseStatsUpdated(String courseId, Acknowledgment ack) {
        try{
            Course course = courseRepo.findById(parseUUID(courseId)).orElse(null);
            if (course == null) { ack.acknowledge(); return; }

            UpdateQuery updateQuery = UpdateQuery.builder(courseId)
                    .withDocument(
                            Document.create()
                                    .append("average_rating",    course.getAverageRating())
                                    .append("total_enrollments", course.getTotalEnrollments())
                                    .append("total_reviews",     course.getTotalReviews())
                                    .append("total_students",    course.getTotalStudents())
                    )
                    .build();
            esOps.update(updateQuery);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Stats update failed for {}: {}", courseId, e.getMessage(), e);
        }
    }

    /** Khi course bị xóa hoặc unpublished */
    @KafkaListener(
            topics   = "course.deleted",
            groupId  = "search-indexer",
            containerFactory = "ackKafkaListenerContainerFactory"
    )
    @Override
    public void onCourseDeleted(String courseId, Acknowledgment ack) {
        try {
            esOps.delete(courseId, IndexCoordinates.of(INDEX));
            cacheService.invalidateAll();
            log.info("Deleted course {} from ES index", courseId);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Delete from ES failed for {}: {}", courseId, e.getMessage(), e);
        }
    }


    /**
     * Full reindex toàn bộ PUBLISHED courses từ Postgres vào ES.
     *
     * Dùng Slice (hasNext cursor) thay vì Page (offset) để:
     * - Tránh SELECT COUNT(*) tốn kém
     * - Không bị OOM khi dataset lớn (offset=10000 phải load 10000 rows)
     *
     * Mỗi batch 100 courses → bulkIndex → ES.
     */
    @Transactional(readOnly = true)
    @Override
    public void fullReindex() {
        log.info("Starting full reindex...");
        long indexed = 0;
        int  page    = 0;
        Slice<Course> slice;

        do {
            slice = courseRepo.findByStatusOrderByIdAsc(
                    CourseStatus.PUBLISHED,
                    PageRequest.of(page++, BATCH)
            );
            List<IndexQuery> batch = slice.getContent().stream()
                    .map(mapper::toDocument)
                    .map(doc -> new IndexQueryBuilder()
                            .withId(doc.getId())
                            .withObject(doc)
                            .build()
                    )
                    .toList();

            if (!batch.isEmpty()) {
                esOps.bulkIndex(batch, IndexCoordinates.of(INDEX));
                indexed += batch.size();
                log.info("Reindexed {} / ~{} courses", indexed,
                        slice.hasNext() ? "?" : indexed);
            }
        } while(slice.hasNext());

        cacheService.invalidateAll();
        log.info("Full reindex completed: {} documents", indexed);
    }

    @Override
    @Scheduled(fixedRate = 3_600_000)
    public void updatePopularityScores() {
        log.info("Updating popularity scores...");
        int page = 0;
        Slice<Course> slice;

        do {
            slice = courseRepo.findByStatusOrderByIdAsc(
                    CourseStatus.PUBLISHED,
                    PageRequest.of(page++, BATCH)
            );

            List<UpdateQuery> updates = slice.getContent().stream()
                    .map(course -> {
                        double score = computePopularity(course);
                        return UpdateQuery.builder(course.getId().toString())
                                .withDocument(Document.create().append("popularity_score", score))
                                .build();
                    })
                    .toList();

            if (!updates.isEmpty()) {
                esOps.bulkUpdate(updates, IndexCoordinates.of(INDEX));
            }
        } while (slice.hasNext());
        log.info("Popularity score update done");
    }

    // helper

    private void indexOneCourse(String courseId){
        Course course = courseRepo.findById(parseUUID(courseId))
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            log.warn("Course {} is not PUBLISHED, skipping index", courseId);
            return;
        }

        CourseDocument doc = mapper.toDocument(course);
        esOps.save(doc);
        log.info("Indexed course: {} - {}", courseId, course.getTitle());
    }

    /**
     * popularity_score = log1p(enrollments) × 0.6
     *                  + log1p(reviews)     × 0.3
     *                  + rating             × 0.1
     *
     * log1p tránh outlier: 10.000 enrollments = log(10001) ≈ 9.2
     * thay vì để nguyên 10000 lấn át tất cả
     */
    private double computePopularity(Course course) {
        int    e = course.getTotalEnrollments() != null ? course.getTotalEnrollments() : 0;
        int    r = course.getTotalReviews()     != null ? course.getTotalReviews()     : 0;
        double g = course.getAverageRating()    != null
                ? course.getAverageRating().doubleValue() : 0.0;

        return Math.log1p(e) * 0.6
                + Math.log1p(r) * 0.3
                + g             * 0.1;
    }

    private UUID parseUUID(String id) {
        return UUID.fromString(id);
    }
}
