package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, QuizAnswerId> {
    @Modifying
    @Query("DELETE FROM QuizAnswer a WHERE a.question.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") UUID quizId);
}
