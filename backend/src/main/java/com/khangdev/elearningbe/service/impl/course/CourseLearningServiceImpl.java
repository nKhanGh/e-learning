package com.khangdev.elearningbe.service.impl.course;

import com.khangdev.elearningbe.dto.response.course.CourseCurriculumResponse;
import com.khangdev.elearningbe.dto.response.course.CourseEnrollmentStatusResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.LectureProgress;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.enrollment.Enrollment;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.EnrollmentStatus;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.repository.EnrollmentRepository;
import com.khangdev.elearningbe.repository.LectureProgressRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.repository.QuizRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.course.CourseLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseLearningServiceImpl implements CourseLearningService {
    private final CourseRepository courseRepository;
    private final CourseSectionRepository courseSectionRepository;
    private final LectureRepository lectureRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LectureProgressRepository lectureProgressRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CourseCurriculumResponse getCurriculum(UUID courseId) {
        Course course = getCourse(courseId);
        Optional<User> currentUser = getCurrentUser();
        Optional<Enrollment> enrollment = getEnrollment(currentUser, courseId);
        boolean canAccessCourse = canAccessCourse(course, enrollment);
        Set<UUID> completedLectureIds = getCompletedLectureIds(currentUser, courseId);

        List<CourseSection> sections = courseSectionRepository
                .findByCourseIdAndIsPublishedTrueOrderByDisplayOrderAsc(courseId);

        List<CourseCurriculumResponse.SectionItem> sectionItems = sections.stream()
                .map(section -> toSectionItem(section, canAccessCourse, completedLectureIds))
                .toList();

        int totalLectures = sectionItems.stream()
                .mapToInt(section -> section.getLectures().size())
                .sum();
        int totalDuration = sectionItems.stream()
                .mapToInt(section -> nullToZero(section.getDurationMinutes()))
                .sum();

        return CourseCurriculumResponse.builder()
                .courseId(courseId)
                .totalSections(sectionItems.size())
                .totalLectures(totalLectures)
                .totalDurationMinutes(totalDuration)
                .sections(sectionItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseEnrollmentStatusResponse getEnrollmentStatus(UUID courseId) {
        Course course = getCourse(courseId);
        Optional<User> currentUser = getCurrentUser();
        Optional<Enrollment> enrollment = getEnrollment(currentUser, courseId);
        Set<UUID> completedLectureIds = getCompletedLectureIds(currentUser, courseId);
        int totalLectures = lectureRepository.countByCourseId(courseId).intValue();

        boolean isFree = isFree(course);
        boolean enrolled = enrollment.isPresent();
        boolean completed = enrollment
                .map(value -> value.getStatus() == EnrollmentStatus.COMPLETED)
                .orElse(false);
        boolean locked = !isFree && !enrolled;

        return CourseEnrollmentStatusResponse.builder()
                .courseId(courseId)
                .authenticated(currentUser.isPresent())
                .free(isFree)
                .enrolled(enrolled)
                .locked(locked)
                .completed(completed)
                .courseAccessStatus(resolveCourseAccessStatus(isFree, enrolled, completed, locked))
                .enrollmentStatus(enrollment.map(Enrollment::getStatus).orElse(null))
                .progressPercentage(enrollment.map(Enrollment::getProgressPercentage).orElse(BigDecimal.ZERO))
                .completedLectures(enrollment.map(Enrollment::getCompletedLectures).orElse(completedLectureIds.size()))
                .totalLectures(totalLectures)
                .enrolledAt(enrollment.map(Enrollment::getEnrolledAt).orElse(null))
                .completedAt(enrollment.map(Enrollment::getCompletedAt).orElse(null))
                .completedLectureIds(completedLectureIds)
                .build();
    }

    private CourseCurriculumResponse.SectionItem toSectionItem(
            CourseSection section,
            boolean canAccessCourse,
            Set<UUID> completedLectureIds
    ) {
        List<CourseCurriculumResponse.LectureItem> lectures = lectureRepository
                .findBySectionIdAndIsPublishedTrueOrderByDisplayOrderAsc(section.getId())
                .stream()
                .map(lecture -> toLectureItem(lecture, canAccessCourse, completedLectureIds))
                .toList();

        return CourseCurriculumResponse.SectionItem.builder()
                .id(section.getId())
                .title(section.getTitle())
                .description(section.getDescription())
                .displayOrder(section.getDisplayOrder())
                .durationMinutes(section.getDurationMinutes())
                .lectures(lectures)
                .build();
    }

    private CourseCurriculumResponse.LectureItem toLectureItem(
            Lecture lecture,
            boolean canAccessCourse,
            Set<UUID> completedLectureIds
    ) {
        boolean completed = completedLectureIds.contains(lecture.getId());
        String lectureStatus = resolveLearningItemStatus(completed, canAccessCourse, lecture.getIsPreview());
        Quiz quiz = lecture.getQuiz() != null
                ? lecture.getQuiz()
                : quizRepository.findByLectureIdAndIsPublishedTrue(lecture.getId()).orElse(null);

        return CourseCurriculumResponse.LectureItem.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .contentType(lecture.getContentType())
                .displayOrder(lecture.getDisplayOrder())
                .durationMinutes(toMinutes(lecture.getVideoDurationSeconds()))
                .videoDurationSeconds(lecture.getVideoDurationSeconds())
                .preview(lecture.getIsPreview())
                .downloadable(lecture.getIsDownloadable())
                .completed(completed)
                .status(lectureStatus)
                .quiz(quiz == null ? null : toQuizItem(quiz, canAccessCourse))
                .build();
    }

    private CourseCurriculumResponse.QuizItem toQuizItem(Quiz quiz, boolean canAccessCourse) {
        return CourseCurriculumResponse.QuizItem.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .totalQuestions(quiz.getTotalQuestions())
                .completed(false)
                .status(canAccessCourse ? "AVAILABLE" : "LOCKED")
                .build();
    }

    private Course getCourse(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String email = authentication.getName();
        if (email == null || email.isBlank() || "anonymousUser".equals(email)) {
            return Optional.empty();
        }

        return userRepository.findByEmail(email);
    }

    private Optional<Enrollment> getEnrollment(Optional<User> user, UUID courseId) {
        return user.flatMap(value -> enrollmentRepository.findByUserIdAndCourseId(value.getId(), courseId));
    }

    private Set<UUID> getCompletedLectureIds(Optional<User> user, UUID courseId) {
        if (user.isEmpty()) {
            return new HashSet<>();
        }

        return lectureProgressRepository.findByUserIdAndCourseId(user.get().getId(), courseId)
                .stream()
                .filter(progress -> Boolean.TRUE.equals(progress.getCompleted()))
                .map(LectureProgress::getLecture)
                .map(Lecture::getId)
                .collect(Collectors.toSet());
    }

    private boolean canAccessCourse(Course course, Optional<Enrollment> enrollment) {
        return isFree(course)
                || enrollment
                .map(value -> value.getStatus() == EnrollmentStatus.ACTIVE
                        || value.getStatus() == EnrollmentStatus.COMPLETED)
                .orElse(false);
    }

    private boolean isFree(Course course) {
        return Boolean.TRUE.equals(course.getIsFree())
                || course.getPrice() == null
                || BigDecimal.ZERO.compareTo(course.getPrice()) == 0;
    }

    private String resolveCourseAccessStatus(boolean isFree, boolean enrolled, boolean completed, boolean locked) {
        if (completed) return "COMPLETED";
        if (enrolled) return "ENROLLED";
        if (isFree) return "FREE";
        if (locked) return "LOCKED";
        return "AVAILABLE";
    }

    private String resolveLearningItemStatus(boolean completed, boolean canAccessCourse, Boolean preview) {
        if (completed) return "COMPLETED";
        if (canAccessCourse) return "AVAILABLE";
        if (Boolean.TRUE.equals(preview)) return "FREE_PREVIEW";
        return "LOCKED";
    }

    private int toMinutes(Integer seconds) {
        if (seconds == null || seconds <= 0) {
            return 0;
        }

        return (int) Math.ceil(seconds / 60.0);
    }

    private int nullToZero(Integer value) {
        return value == null ? 0 : value;
    }
}

