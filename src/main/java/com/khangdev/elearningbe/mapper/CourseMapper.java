package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.user.Instructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public abstract class CourseMapper {


    @Autowired
    protected UserMapper userMapper;

    @Mapping(
            target = "instructor",
            expression = "java(instructorToUserResponse(course.getInstructor()))"
    )
    public abstract CourseResponse toResponse(Course course);

    public abstract void updateCourse(
            @MappingTarget Course course,
            CourseUpdateRequest request
    );

    public abstract Course toCourse(CourseCreationRequest request);

    protected UserResponse instructorToUserResponse(Instructor instructor) {
        if (instructor == null || instructor.getUser() == null) {
            return null;
        }
        return userMapper.toResponse(instructor.getUser());
    }
}

