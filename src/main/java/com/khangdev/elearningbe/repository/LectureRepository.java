package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LectureRepository extends JpaRepository<Lecture, UUID> {
    List<Lecture> findBySectionId(UUID courseId);
    List<Lecture> findBySectionIdAndIsPublishedTrue(UUID courseId);

    @Query("SELECT MAX(l.displayOrder) FROM Lecture l WHERE l.section.id = :sectionId")
    Integer findMaxDisplayOrderBySectionId(UUID sectionId);
}
