package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.response.EnrollmentResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.id.EnrollmentId;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.EnrollmentStatus;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.EnrollmentMapper;
import com.khangdev.elearningbe.repository.*;
import com.khangdev.elearningbe.service.course.EnrollmentService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository  lectureRepository;
    private final LectureProgressRepository lectureProgressRepository;

    private final EnrollmentMapper enrollmentMapper;

    private final UserService userService;

    KafkaTemplate<String, String> kafkaTemplate;


    @Override
    @Transactional
    public EnrollmentResponse createEnrollment(UUID courseId) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(!user.getRole().equals(UserRole.STUDENT))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        EnrollmentId enrollmentId = EnrollmentId.builder()
                .userId(userId)
                .courseId(courseId)
                .build();

        if(enrollmentRepository.existsById(enrollmentId))
            throw new AppException(ErrorCode.ENROLLMENT_EXISTED);

        Enrollment enrollment = Enrollment.builder()
                .id(enrollmentId)
                .user(user)
                .course(course)
                .enrolledAt(Instant.now())
                .lastAccessedAt(Instant.now())
                .status(EnrollmentStatus.ACTIVE)
                .paymentAmount(course.getPrice())
                .build();
        enrollmentRepository.save(enrollment);
        course.setTotalEnrollments(course.getTotalEnrollments() + 1);
        courseRepository.save(course);
        kafkaTemplate.send("course.stats.updated", course.getId().toString());
        return enrollmentMapper.toResponse(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByCourseId(UUID courseId) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(!course.getInstructor().getId().equals(userId) && !user.getRole().equals(UserRole.ADMIN))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(enrollmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByUserId(UUID userId) {
        UUID actorId = userService.getMyInfo().getId();

        if (actorId.equals(userId)) {
            return enrollmentRepository.findByUserId(userId).stream()
                    .map(enrollmentMapper::toResponse)
                    .toList();
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (actor.getRole() != UserRole.ADMIN) {
            if (actor.getRole() == UserRole.INSTRUCTOR) {
                List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

                List<Enrollment> filteredEnrollments = enrollments.stream()
                        .filter(e -> e.getCourse().getInstructor().getId().equals(actorId))
                        .toList();

                return filteredEnrollments.stream()
                        .map(enrollmentMapper::toResponse)
                        .toList();
            }

            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return enrollmentRepository.findByUserId(userId).stream()
                .map(enrollmentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollmentById(EnrollmentId enrollmentId) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));
        if(!enrollment.getUser().getId().equals(userId)
                && !enrollment.getCourse().getInstructor().getId().equals(userId)
                && !user.getRole().equals(UserRole.ADMIN)
        ){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return enrollmentMapper.toResponse(enrollment);
    }

    @Override
    @Transactional
    public EnrollmentResponse access(UUID courseId) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Enrollment enrollment = enrollmentRepository.findById(EnrollmentId.builder()
                .courseId(courseId)
                .userId(userId)
                .build()
        ).orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE
                && enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            throw new AppException(ErrorCode.ENROLLMENT_INACTIVE);
        }
        if(!user.getRole().equals(UserRole.STUDENT) && !enrollment.getUser().getId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        enrollment.setLastAccessedAt(Instant.now());
        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponse(enrollment);
    }

    @Override
    @Transactional
    public EnrollmentResponse complete(UUID courseId) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Enrollment enrollment = enrollmentRepository.findById(EnrollmentId.builder()
                .courseId(courseId)
                .userId(userId)
                .build()
        ).orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        Long totalLectures = lectureRepository.countByCourseId(courseId);
        Long completedLectures = lectureProgressRepository
                .countCompletedByUserIdAndCourseId(userId, courseId);

        if (!completedLectures.equals(totalLectures)) {
            throw new AppException(ErrorCode.COURSE_NOT_FULLY_COMPLETED);
        }
        if(!user.getRole().equals(UserRole.STUDENT) && !enrollment.getUser().getId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        enrollment.setCompletedAt(Instant.now());
        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setProgressPercentage(BigDecimal.valueOf(100));

        enrollmentRepository.save(enrollment);
        return enrollmentMapper.toResponse(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getMyEnrollment(UUID courseId) {
        UUID userId = userService.getMyInfo().getId();
        return getEnrollmentById(EnrollmentId.builder()
                .userId(userId)
                .courseId(courseId)
                .build());
    }
}
