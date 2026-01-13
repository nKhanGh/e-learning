package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.QuizAnswer;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, QuizAnswerId> {
}
