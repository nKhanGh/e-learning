package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, QuizAnswerId> {
    @Modifying
    @Query("DELETE FROM QuizAnswer a WHERE a.question.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") UUID quizId);

    @Query("""
            SELECT answer FROM QuizAnswer answer
            JOIN FETCH answer.question question
            WHERE answer.id.userId = :userId
              AND answer.id.attemptNumber = :attemptNumber
              AND question.quiz.id = :quizId
            """)
    List<QuizAnswer> findAllForAttempt(
            @Param("userId") UUID userId,
            @Param("quizId") UUID quizId,
            @Param("attemptNumber") Integer attemptNumber
    );
}
