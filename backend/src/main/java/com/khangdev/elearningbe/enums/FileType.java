package com.khangdev.elearningbe.enums;

import lombok.Getter;

@Getter
public enum FileType {
    AVATAR("avatars"),
    LECTURE_VIDEO("lectures/videos"),
    LECTURE_DOCUMENT("lectures/documents");

    private final String folder;
    FileType(String folder) {
        this.folder = folder;
    }

}
