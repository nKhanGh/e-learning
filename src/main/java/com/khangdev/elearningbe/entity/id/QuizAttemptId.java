package com.khangdev.elearningbe.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class QuizAttemptId implements Serializable {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "quiz_id")
    private UUID quizId;

    @Column(name = "attempt_number")
    private Integer attemptNumber;
}
