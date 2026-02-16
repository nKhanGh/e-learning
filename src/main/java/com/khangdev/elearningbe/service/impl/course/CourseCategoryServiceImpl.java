package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.mapper.CourseCategoryMapper;
import com.khangdev.elearningbe.repository.CourseCategoryRepository;
import com.khangdev.elearningbe.service.course.CourseCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseCategoryServiceImpl implements CourseCategoryService {

    CourseCategoryRepository courseCategoryRepository;
    CourseCategoryMapper courseCategoryMapper;

    @Override
    public CourseCategoryResponse createCourseCategory(CourseCategoryRequest request) {
        CourseCategory courseCategory = courseCategoryMapper.toCategory(request);
        courseCategoryRepository.save(courseCategory);
        return courseCategoryMapper.toResponse(courseCategory);
    }
}
