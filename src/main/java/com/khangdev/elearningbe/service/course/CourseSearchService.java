package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSearchResponse;

public interface CourseSearchService {
    CourseSearchResponse.Page search(CourseSearchRequest req);
    public CourseSearchResponse.Page searchFallback(CourseSearchRequest req, Throwable t);

}
