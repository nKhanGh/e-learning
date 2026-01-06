package com.khangdev.elearningbe.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class QuizAttemptId {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "quiz_id")
    private UUID quizId;
}
