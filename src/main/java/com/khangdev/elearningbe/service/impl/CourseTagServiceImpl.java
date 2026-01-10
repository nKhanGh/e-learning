package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;
import com.khangdev.elearningbe.entity.course.CourseTag;
import com.khangdev.elearningbe.mapper.CourseTagMapper;
import com.khangdev.elearningbe.repository.CourseTagRepository;
import com.khangdev.elearningbe.service.CourseTagService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseTagServiceImpl implements CourseTagService {
    CourseTagRepository courseTagRepository;
    CourseTagMapper courseTagMapper;


    @Override
    public CourseTagResponse createCourseTag(CourseTagRequest request) {
        String tagName = request.getName();
        String slug = tagName.trim().toLowerCase().replace(" ", "-");
        var oldCourseTag = courseTagRepository.findBySlug(slug);
        if(oldCourseTag.isPresent())
            return courseTagMapper.toCourseTagResponse(oldCourseTag.get());
        CourseTag courseTag = CourseTag.builder()
                .name(request.getName())
                .slug(slug)
                .build();
        courseTagRepository.save(courseTag);
        return courseTagMapper.toCourseTagResponse(courseTag);
    }
}
