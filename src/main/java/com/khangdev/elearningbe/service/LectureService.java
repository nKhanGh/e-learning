package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.response.course.PublicLectureResponse;

import java.util.List;
import java.util.UUID;

public interface LectureService {
    List<LectureResponse> getLecturesBySectionId(UUID sectionId);
    List<PublicLectureResponse> getGeneralLecturesBySectionId(UUID sectionId);
    List<LectureResponse> getPublicLecturesBySectionId(UUID sectionId);
    LectureResponse getByLectureId(UUID lectureId);
    LectureResponse getPublicLectureByLectureId(UUID lectureId);
    LectureResponse createLecture(LectureRequest lectureRequest);
    void deleteByLectureId(UUID lectureId);
    LectureResponse updateLecture(UUID lectureId, LectureUpdateRequest request);
}
