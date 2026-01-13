package com.khangdev.elearningbe.entity.course;

import com.khangdev.elearningbe.converter.StringListJsonConverter;
import com.khangdev.elearningbe.entity.common.BaseEntity;
import com.khangdev.elearningbe.entity.id.QuizAnswerId;
import com.khangdev.elearningbe.entity.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "quiz_answers")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuizAnswer extends BaseEntity {


    @EmbeddedId
    private QuizAnswerId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("quizQuestionId")
    @JoinColumn(name = "quiz_question_id")
    private QuizQuestion question;

    @Convert(converter = StringListJsonConverter.class)
    @Column(nullable = false)
    private List<String> answers;

    @Column(name = "score", precision = 5, scale = 2)
    private BigDecimal score;
}
