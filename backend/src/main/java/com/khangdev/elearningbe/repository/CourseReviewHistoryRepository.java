package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.CourseReviewHistory;
import com.khangdev.elearningbe.enums.CourseReviewAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseReviewHistoryRepository extends JpaRepository<CourseReviewHistory, UUID> {
    List<CourseReviewHistory> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    Optional<CourseReviewHistory> findFirstByCourseIdAndActionOrderByCreatedAtDesc(
            UUID courseId,
            CourseReviewAction action
    );
}
