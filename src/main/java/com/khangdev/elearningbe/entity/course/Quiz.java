package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes", indexes = {
        @Index(name = "idx_lecture_id", columnList = "lecture_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", unique = true)
    private Lecture lecture;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "passing_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal passingScore = new BigDecimal("70.00");

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "randomize_questions")
    @Builder.Default
    private Boolean randomizeQuestions = false;

    @Column(name = "show_correct_answers")
    @Builder.Default
    private Boolean showCorrectAnswers = true;

    @Column(name = "show_answers_after_submission")
    @Builder.Default
    private Boolean showAnswersAfterSubmission = true;

    @Column(name = "total_questions")
    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(name = "total_points", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalPoints = BigDecimal.ZERO;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL)
    private List<QuizQuestion> questions = new ArrayList<>();

    public void addQuestion(QuizQuestion question) {
        questions.add(question);
        question.setQuiz(this);
        totalQuestions = questions.size();
    }

    public void removeQuestion(QuizQuestion question) {
        questions.remove(question);
        question.setQuiz(null);
        totalQuestions = questions.size();
    }

}
