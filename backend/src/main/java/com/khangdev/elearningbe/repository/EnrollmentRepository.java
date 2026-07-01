package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, EnrollmentId> {
    @Query("""
        select e.user from Enrollment e
        where e.course.id = :courseId
    """)
    Page<User> findUsersByCourseId(UUID courseId, Pageable pageable);

    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    List<Enrollment> findByCourseId(UUID courseId);
    List<Enrollment> findByUserId(UUID userId);
}
