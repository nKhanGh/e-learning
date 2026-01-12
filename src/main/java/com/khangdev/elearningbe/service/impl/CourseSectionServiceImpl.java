package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.CourseSectionRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.course.CourseSectionResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.mapper.CourseSectionMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.service.CourseSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseSectionServiceImpl implements CourseSectionService {
    private final CourseSectionRepository courseSectionRepository;
    private final CourseRepository courseRepository;
    private final CourseSectionMapper courseSectionMapper;

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public CourseSectionResponse createCourseSection(CourseSectionRequest courseSectionRequest) {
        CourseSection courseSection = courseSectionMapper.toEntity(courseSectionRequest);
        Course course = courseRepository.findById(courseSectionRequest.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        courseSection.setCourse(course);
        courseSectionRepository.save(courseSection);
        return courseSectionMapper.toResponse(courseSectionRepository.save(courseSection));
    }

    @Override
    public List<CourseSectionResponse> getCourseSectionByCourse(UUID courseId) {
        return courseSectionRepository.findByCourseId(courseId)
                .stream().map(courseSectionMapper::toResponse).toList();
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public CourseSectionResponse updateCourseSection(UUID courseSectionId, CourseSectionRequest courseSectionRequest) {
        CourseSection courseSection = courseSectionRepository.findById(courseSectionId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_SECTION_NOT_FOUND));
        courseSectionMapper.updateEntity(courseSection, courseSectionRequest);
        Course course = courseRepository.findById(courseSectionRequest.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        courseSection.setCourse(course);
        courseSectionRepository.save(courseSection);
        return courseSectionMapper.toResponse(courseSectionRepository.save(courseSection));
    }

    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public void deleteCourseSection(UUID courseSectionId) {
        courseSectionRepository.deleteById(courseSectionId);
    }

    @Override
    public CourseSectionResponse getCourseSectionById(UUID courseSectionId) {
        return courseSectionMapper.toResponse(courseSectionRepository.findById(courseSectionId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_SECTION_NOT_FOUND))
        );
    }
}
