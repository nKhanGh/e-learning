package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;

import java.util.List;
import java.util.UUID;

public interface CourseSectionService {
    CourseSectionResponse createCourseSection(CourseSectionRequest courseSectionRequest);
    List<CourseSectionResponse> getCourseSectionByCourse(UUID courseId);
    CourseSectionResponse updateCourseSection(UUID courseSectionId, CourseSectionRequest courseSectionRequest);
    void deleteCourseSection(UUID courseSectionId);
    CourseSectionResponse getCourseSectionById(UUID courseSectionId);

}
