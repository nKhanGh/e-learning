package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.enums.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, UUID> {
    List<Lecture> findBySectionId(UUID courseId);
    List<Lecture> findBySectionIdOrderByDisplayOrderAsc(UUID courseId);
    List<Lecture> findBySectionCourseId(UUID courseId);
    @Query("""
        select l from Lecture l
        where l.section.course.id = :courseId
        order by l.section.displayOrder asc, l.displayOrder asc
    """)
    List<Lecture> findByCourseIdOrderBySectionAndDisplayOrder(@Param("courseId") UUID courseId);
    List<Lecture> findBySectionIdAndIsPublishedTrue(UUID courseId);
    List<Lecture> findBySectionIdAndIsPublishedTrueOrderByDisplayOrderAsc(UUID courseId);

    @Query("""
        select count(l) from Lecture l
        where l.section.course.id = :courseId
    """)
    Long countByCourseId(@Param("courseId") UUID courseId);

    @Query("""
        select count(l) from Lecture l
        where l.section.course.id = :courseId
        and l.contentType = :contentType
    """)
    Long countByCourseIdAndContentType(
            @Param("courseId") UUID courseId,
            @Param("contentType") ContentType contentType
    );

    @Query("SELECT MAX(l.displayOrder) FROM Lecture l WHERE l.section.id = :sectionId")
    Integer findMaxDisplayOrderBySectionId(UUID sectionId);
}
