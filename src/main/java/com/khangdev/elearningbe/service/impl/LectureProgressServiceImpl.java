package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.request.course.NoteRequest;
import com.khangdev.elearningbe.dto.response.LectureProgressResponse;
import com.khangdev.elearningbe.entity.course.LectureProgress;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.id.LectureProgressId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.LectureProgressMapper;
import com.khangdev.elearningbe.repository.*;
import com.khangdev.elearningbe.service.LectureProgressService;
import com.khangdev.elearningbe.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LectureProgressServiceImpl implements LectureProgressService {
    private final UserRepository userRepository;
    private final LectureProgressRepository lectureProgressRepository;
    private final LectureRepository lectureRepository;
    private final EnrollmentRepository  enrollmentRepository;

    private final LectureProgressMapper lectureProgressMapper;

    private final UserService userService;

    @Override
    @Transactional
    public LectureProgressResponse createLectureProgress(UUID lectureId) {
        UUID userId = userService.getMyInfo().getId();
        LectureProgress lectureProgress = LectureProgress.builder()
                .id(LectureProgressId.builder()
                        .userId(userId)
                        .lectureId(lectureId)
                        .build())
                .lastWatchedAt(Instant.now())
                .user(userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)))
                .lecture(lectureRepository.findById(lectureId).orElseThrow(() -> new AppException(ErrorCode.LECTURE_NOT_FOUND)))
                .build();
        lectureProgressRepository.save(lectureProgress);
        return lectureProgressMapper.toResponse(lectureProgress);
    }

    @Override
    @Transactional
    public LectureProgressResponse markAsCompleted(UUID lectureId) {
        UUID userId = userService.getMyInfo().getId();
        LectureProgress lectureProgress = lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_PROGRESS_NOT_FOUND));
        UUID courseId = lectureProgress.getLecture().getSection().getCourse().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Enrollment enrollment = enrollmentRepository.findById(EnrollmentId.builder()
                .userId(userId)
                .courseId(courseId)
                .build()
        ).orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));
        if (!user.getRole().equals(UserRole.STUDENT) && !enrollment.getUser().getId().equals(userId)){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        enrollment.setLastAccessedAt(Instant.now());
        Long totalLectures = lectureRepository.countByCourseId(courseId);
        Long completedLectures = lectureProgressRepository
                .countCompletedByUserIdAndCourseId(userId, courseId);

        if (totalLectures > 0) {
            BigDecimal progressPercentage = BigDecimal.valueOf(completedLectures)
                    .divide(BigDecimal.valueOf(totalLectures), 5, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            enrollment.setProgressPercentage(progressPercentage);
        }
        enrollmentRepository.save(enrollment);

        lectureProgress.setCompleted(true);
        lectureProgress.setCompletedAt(Instant.now());
        lectureProgressRepository.save(lectureProgress);
        return lectureProgressMapper.toResponse(lectureProgress);
    }

    @Override
    public LectureProgressResponse getProgress(UUID userId, UUID lectureId){
        LectureProgress lectureProgress = lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_PROGRESS_NOT_FOUND));
        UUID actorId = userService.getMyInfo().getId();
        if(!actorId.equals(userId)){
            if (!lectureProgress.getLecture().getSection().getCourse().getInstructor().getId().equals(actorId)){
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }
        return lectureProgressMapper.toResponse(lectureProgress);
    }

    @Override
    public List<LectureProgressResponse> getCourseProgress(UUID userId, UUID courseId) {
        List<LectureProgress> lectureProgresses = lectureProgressRepository.findByUserIdAndCourseId(userId, courseId);
        UUID actorId = userService.getMyInfo().getId();
        if(!lectureProgresses.isEmpty()){
            if(!actorId.equals(userId)){
                if(!lectureProgresses.get(0).getLecture().getSection().getCourse().getInstructor().getId().equals(actorId)){
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
            }
        }
        return lectureProgresses.stream().map(lectureProgressMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public LectureProgressResponse toggleBookmark(UUID lectureId) {
        UUID userId = userService.getMyInfo().getId();
        LectureProgress lectureProgress = lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_PROGRESS_NOT_FOUND));
        lectureProgress.setBookmarked(!lectureProgress.getBookmarked());
        lectureProgressRepository.save(lectureProgress);
        return lectureProgressMapper.toResponse(lectureProgress);
    }

    @Override
    public List<LectureProgressResponse> getBookmarkedLectures() {
        UUID userId = userService.getMyInfo().getId();
        List<LectureProgress> lectureProgresses = lectureProgressRepository.findByBookmarkedTrueAndUserId(userId);
        return lectureProgresses.stream().map(lectureProgressMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public LectureProgressResponse addNotes(UUID lectureId, NoteRequest note) {
        UUID userId = userService.getMyInfo().getId();
        LectureProgress lectureProgress = lectureProgressRepository.findByUserIdAndLectureId(userId, lectureId)
                .orElseThrow(() -> new AppException(ErrorCode.LECTURE_PROGRESS_NOT_FOUND));
        lectureProgress.setNotes(note.getNote());
        lectureProgressRepository.save(lectureProgress);
        return lectureProgressMapper.toResponse(lectureProgress);
    }
}
