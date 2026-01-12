package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByQuizId(UUID quizId);
    List<QuizQuestion> findByQuizIdOrderByDisplayOrderAsc(UUID quizId);

    @Query("SELECT MAX(q.displayOrder) FROM QuizQuestion q WHERE q.quiz.id = :quizId")
    Integer findMaxDisplayOrderByQuizId(UUID quizId);

}
