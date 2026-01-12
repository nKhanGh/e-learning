package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    Optional<Quiz> findByLectureId(UUID lectureId);
}
