package com.khangdev.elearningbe.service.course;

import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSearchResponse;

import java.util.List;
import java.util.Optional;

public interface CourseSearchCacheService {
    Optional<CourseSearchResponse.Page> get(String key);
    void putAsync(String key, CourseSearchResponse.Page page,
                         CourseSearchRequest req);

    void invalidateAll();
    List<CourseSearchResponse.CourseItem> getHotCourses(int size);
    String buildKey(CourseSearchRequest req);

}
