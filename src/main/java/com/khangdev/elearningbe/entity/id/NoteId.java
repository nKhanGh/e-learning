package com.khangdev.elearningbe.entity.id;

import jakarta.persistence.Column;

import java.io.Serializable;
import java.util.UUID;

public class NoteId implements Serializable {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "lecture_id")
    private UUID lectureId;
}
