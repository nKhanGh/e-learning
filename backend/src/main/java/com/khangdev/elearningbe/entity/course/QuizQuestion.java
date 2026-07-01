package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.entity.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_questions", indexes = {
        @Index(name = "idx_quiz_id", columnList = "quiz_id"),
        @Index(name = "idx_display_order", columnList = "quiz_id, display_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal points = BigDecimal.ONE;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> options;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON", name = "correct_answers")
    private List<String> correctAnswers;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;
}
