package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.QuizAttempt;
import com.khangdev.elearningbe.entity.id.QuizAttemptId;
import com.khangdev.elearningbe.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, QuizAttemptId> {
    @Query("SELECT MAX(q.id.attemptNumber) FROM QuizAttempt q WHERE q.quiz.id = :quizId AND q.user.id = :userId")
    Integer findMaxAttemptNumber(UUID quizId, UUID userId);

    @Modifying
    @Query("DELETE FROM QuizAttempt q WHERE q.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") UUID quizId);

    List<QuizAttempt> findAllByUserIdAndQuizId(UUID userId, UUID quizId);

    UUID user(User user);
}
