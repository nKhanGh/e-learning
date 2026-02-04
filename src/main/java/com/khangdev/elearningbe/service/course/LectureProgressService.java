package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.NoteRequest;
import com.khangdev.elearningbe.dto.response.LectureProgressResponse;

import java.util.List;
import java.util.UUID;

public interface LectureProgressService {
    LectureProgressResponse createLectureProgress(UUID lectureId);

    LectureProgressResponse markAsCompleted(UUID lectureId);

    LectureProgressResponse getProgress(UUID userId, UUID lectureId);

    List<LectureProgressResponse> getCourseProgress(UUID userId, UUID courseId);

    LectureProgressResponse toggleBookmark(UUID lectureId);

    List<LectureProgressResponse> getBookmarkedLectures();

    LectureProgressResponse addNotes(UUID lectureId, NoteRequest note);
}
