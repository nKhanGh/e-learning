package com.khangdev.elearningbe.entity.id;

import jakarta.persistence.Column;

import java.util.UUID;

public class NoteId {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "lecture_id")
    private UUID lectureId;
}
