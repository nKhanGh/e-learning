package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseSectionRepository extends JpaRepository<CourseSection, UUID> {
    List<CourseSection> findByCourseId(UUID courseId);
}
