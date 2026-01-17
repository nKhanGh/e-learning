package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;

public interface CourseTagService {
    CourseTagResponse createCourseTag(CourseTagRequest request);
}
