package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID>, JpaSpecificationExecutor<Course> {
    Page<Course> findByInstructorId(UUID instructorId, Pageable pageable);
    List<Course> findByStatus(CourseStatus status);
    Slice<Course> findByStatusOrderByIdAsc(CourseStatus status,  Pageable pageable);
}
