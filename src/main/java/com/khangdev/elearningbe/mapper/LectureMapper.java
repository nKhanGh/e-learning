package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.entity.course.Lecture;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LectureMapper {
    LectureResponse toLectureResponse(Lecture lecture);
    Lecture toLecture(LectureRequest request);
    void updateLecture(@MappingTarget Lecture lecture, LectureUpdateRequest request);
}
