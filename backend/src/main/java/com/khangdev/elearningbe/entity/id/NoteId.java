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
public class NoteId implements Serializable {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "lecture_id")
    private UUID lectureId;
}
