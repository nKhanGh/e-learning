package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.response.course.PublicLectureResponse;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.LectureMapper;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.service.course.LectureService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LectureServiceImpl implements LectureService {
    private final LectureRepository lectureRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final UserService userService;
    private final LectureMapper lectureMapper;

    private void authorizeRead(UUID instructorId) {
        var user = userService.getMyInfo();
        if (user.getRole() != UserRole.ADMIN && !instructorId.equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public List<LectureResponse> getLecturesBySectionId(UUID sectionId) {
        CourseSection courseSection = courseSectionRepository.findById(sectionId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_SECTION_NOT_FOUND));
        authorizeRead(courseSection.getCourse().getInstructor().getId());
        return lectureRepository.findBySectionIdOrderByDisplayOrderAsc(sectionId).stream()
                .map(lectureMapper::toLectureResponse).toList();
    }

    @Override
    public List<PublicLectureResponse> getGeneralLecturesBySectionId(UUID sectionId) {
        return lectureRepository.findBySectionIdAndIsPublishedTrueOrderByDisplayOrderAsc(sectionId)
                .stream().map(lectureMapper::toPublicLectureResponse).toList();
    }

    @Override
    public List<LectureResponse> getPublicLecturesBySectionId(UUID sectionId) {
        return lectureRepository.findBySectionIdAndIsPublishedTrueOrderByDisplayOrderAsc(sectionId)
                .stream().map(lectureMapper::toLectureResponse).toList();
    }

    @Override
    public LectureResponse getPublicLectureByLectureId(UUID lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if (!lecture.getIsPublished() && !lecture.getSection().getCourse().getInstructor().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return  lectureMapper.toLectureResponse(lecture);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    public LectureResponse getByLectureId(UUID lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));
        authorizeRead(lecture.getSection().getCourse().getInstructor().getId());
        return lectureMapper.toLectureResponse(lecture);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public LectureResponse createLecture(LectureRequest lectureRequest) {
        CourseSection section = courseSectionRepository.findById(lectureRequest.getSectionId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_SECTION_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if(!section.getCourse().getInstructor().getId().equals(userId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Lecture lecture = lectureMapper.toLecture(lectureRequest);
        lecture.setSection(section);
        Integer maxOrder = lectureRepository.findMaxDisplayOrderBySectionId(section.getId());
        lecture.setDisplayOrder(maxOrder != null ? maxOrder + 1 : 1);

        lectureRepository.save(lecture);
        return lectureMapper.toLectureResponse(lecture);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public void deleteByLectureId(UUID lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if (!lecture.getSection().getCourse().getInstructor().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        lectureRepository.delete(lecture);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public LectureResponse updateLecture(UUID lectureId, LectureUpdateRequest request) {
        Lecture lecture = lectureRepository.findById(lectureId).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND));
        UUID userId = userService.getMyInfo().getId();
        if (!lecture.getSection().getCourse().getInstructor().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        lectureMapper.updateLecture(lecture, request);
        return lectureMapper.toLectureResponse(lectureRepository.save(lecture));
    }
}
