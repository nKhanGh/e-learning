package com.khangdev.elearningbe.service.impl.course;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseRejectRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.AdminCourseReviewDetailResponse;
import com.khangdev.elearningbe.dto.response.course.AdminCourseReviewItemResponse;
import com.khangdev.elearningbe.dto.response.course.CourseCurriculumResponse;
import com.khangdev.elearningbe.dto.response.course.CoursePublishChecklistResponse;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.course.CourseReviewHistoryResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.entity.course.CourseReviewHistory;
import com.khangdev.elearningbe.entity.course.CourseSection;
import com.khangdev.elearningbe.entity.course.Lecture;
import com.khangdev.elearningbe.entity.course.Quiz;
import com.khangdev.elearningbe.entity.course.CourseTag;
import com.khangdev.elearningbe.enums.ContentType;
import com.khangdev.elearningbe.enums.CourseReviewAction;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.repository.CourseCategoryRepository;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseReviewHistoryRepository;
import com.khangdev.elearningbe.repository.CourseSectionRepository;
import com.khangdev.elearningbe.repository.CourseTagRepository;
import com.khangdev.elearningbe.repository.LectureRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.course.CourseService;
import com.khangdev.elearningbe.service.course.CourseTagService;
import com.khangdev.elearningbe.service.common.RedisService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {
    CourseRepository courseRepository;
    CourseReviewHistoryRepository courseReviewHistoryRepository;
    CourseSectionRepository courseSectionRepository;
    LectureRepository lectureRepository;
    CourseMapper courseMapper;
    UserRepository userRepository;
    CourseCategoryRepository courseCategoryRepository;
    CourseTagRepository courseTagRepository;
    CourseTagService courseTagService;
    ObjectMapper objectMapper;

    UserMapper userMapper;
    RedisService redisService;

    KafkaTemplate<String, String> kafkaTemplate;

    private static final String PASSED = "PASSED";
    private static final String FAILED = "FAILED";
    private static final String WARNING = "WARNING";


    @Override
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    public CourseResponse createCourse(CourseCreationRequest request) {
        Course course = courseMapper.toCourse(request);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        course.setInstructor(user.getInstructor());

        CourseCategory category = courseCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));
        category.setDisplayOrder(category.getDisplayOrder() + 1);
        course.setCategory(category);

        request.getTagNames().forEach(tag -> courseTagService
                .createCourseTag(CourseTagRequest
                        .builder()
                        .name(tag)
                        .build()
                )
        );

        List<CourseTag> courseTagList =  courseTagRepository.findAllBySlugIn(
                request.getTagNames().stream().map(
                tag ->tag.trim().toLowerCase().replace(" ", "-")).toList()
        );

        courseTagList.forEach(tag -> tag.setUsageCount(tag.getUsageCount() + 1));
        course.setTags(courseTagList);

        courseRepository.save(course);
        if (course.getStatus().equals(CourseStatus.PUBLISHED))
            kafkaTemplate.send("course.published", course.getId().toString());

        CourseResponse result =  courseMapper.toResponse(course);
        result.setInstructor(userMapper.toResponse(user));
        return result;
    }

    @Override
    public CourseResponse updateCourse(UUID courseId, CourseUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user =  userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        CourseStatus lastStatus = course.getStatus();
        if(user.getRole() != UserRole.ADMIN && !user.getId().equals(course.getInstructor().getId()))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        courseMapper.updateCourse(course, request);
        if (request.getCategoryId() != null) {
            CourseCategory category = courseCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }
        courseRepository.save(course);

        if (course.getStatus().equals(CourseStatus.PUBLISHED)){
            kafkaTemplate.send("course.published", course.getId().toString());
        } else if (lastStatus == CourseStatus.PUBLISHED) {
            kafkaTemplate.send("course.deleted",  course.getId().toString());
        }
        return  courseMapper.toResponse(course);
    }

    @Override
    public PageResponse<CourseResponse> searchCourse(CourseSearchRequest request, int page, int size) throws JsonProcessingException {

        String requestHash;
        if (request.getTagNames() != null) {
            request.getTagNames().sort(String::compareTo);
        }

        try{
            requestHash = DigestUtils.md5DigestAsHex(
                    objectMapper.writeValueAsBytes(request)
            );
        } catch (JsonProcessingException e) {
            requestHash = String.valueOf(request.hashCode());
        }
        String cacheKey = String.format("search:course:%d:%d:%s", page, size, requestHash);
        String cached = redisService.getValue(cacheKey);
        if(cached != null) {
            return objectMapper.readValue(cached, new TypeReference<>() {});
        }


        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Course> baseSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            if (request.getLevel() != null){
                predicates.add(cb.equal(root.get("level"), request.getLevel()));
            }

            if (request.getMinPrice() != null && !request.getIsFree()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }

            if (request.getMaxPrice() != null && !request.getIsFree()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            if (request.getMinAverageRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), request.getMinAverageRating()));
            }

            if(request.getMaxAverageRating() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("averageRating"), request.getMaxAverageRating()));
            }

            if (request.getIsFree() != null){
                predicates.add(cb.equal(root.get("isFree"), request.getIsFree()));
            }

            if (request.getHasQuiz() != null) {
                predicates.add(cb.equal(root.get("hasQuizzes"), request.getHasQuiz()));
            }

            if (request.getTagNames() != null && !request.getTagNames().isEmpty()){
                Join<Course, CourseTag> join = root.join("tags", JoinType.INNER);
                predicates.add(join.get("name").in(request.getTagNames()));
                assert query != null;
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Specification<Course> keywordSpec = null;
        if (request.getKeyword() != null && !request.getKeyword().isBlank()){
            String keyword = "%" + request.getKeyword().trim().toLowerCase() + "%";
            keywordSpec = (root, query, cb) -> {
                assert query != null;
                query.distinct(true);
                List<Predicate> predicates = new ArrayList<>();

                predicates.add(cb.like(cb.lower(root.get("title")), keyword));
                predicates.add(cb.like(cb.lower(root.get("description")), keyword));

                Join<Course, Instructor> instructorJoin =
                        root.join("instructor", JoinType.LEFT);
                Join<Instructor, User> userJoin =
                        instructorJoin.join("user", JoinType.LEFT);

                predicates.add(cb.like(cb.lower(userJoin.get("firstName")), keyword));
                predicates.add(cb.like(cb.lower(userJoin.get("lastName")), keyword));

                return cb.or(predicates.toArray(new Predicate[0]));
            };
        }

        Specification<Course> specification = keywordSpec == null ? baseSpec : baseSpec.and(keywordSpec);

        Page<Course> coursePage =  courseRepository.findAll(specification, pageable);
        List<CourseResponse> items = coursePage.getContent().stream()
                .map(courseMapper::toResponse).toList();

        PageResponse<CourseResponse> response =  PageResponse.<CourseResponse>builder()
                .page(page)
                .size(size)
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .items(items)
                .build();

        redisService.setValue(cacheKey, objectMapper.writeValueAsString(response), 10, TimeUnit.MINUTES);
        return response;
    }

    @Override
    public CourseResponse getCourseById(UUID courseId) {
        return courseMapper.toResponse(courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND))
        );
    }

    @Override
    public void deleteCourse(UUID courseId) {
        courseRepository.deleteById(courseId);
        kafkaTemplate.send("course.deleted",  courseId.toString());
    }

    @Override
    public PageResponse<CourseResponse> getCourses(UUID instructorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,  Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Course> coursePage =  courseRepository.findByInstructorId(instructorId, pageable);

        return PageResponse.<CourseResponse>builder()
                .items(coursePage.getContent().stream().map(courseMapper::toResponse).toList())
                .page(page)
                .size(size)
                .totalPages(coursePage.getTotalPages())
                .totalElements(coursePage.getTotalElements())
                .build();

    }

    @Override
    public PageResponse<CourseResponse> getCoursesByInstructorUserId(
            UUID userId,
            int page,
            int size,
            String keyword,
            CourseStatus status
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Course> baseSpecification = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("instructor").get("user").get("id"), userId));

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Specification<Course> specification = status == null
                ? baseSpecification
                : baseSpecification.and((root, query, cb) -> cb.equal(root.get("status"), status));

        Page<Course> coursePage = courseRepository.findAll(specification, pageable);
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        statusCounts.put("ALL", courseRepository.count(baseSpecification));
        for (CourseStatus courseStatus : CourseStatus.values()) {
            statusCounts.put(
                    courseStatus.name(),
                    courseRepository.count(baseSpecification.and(
                            (root, query, cb) -> cb.equal(root.get("status"), courseStatus)
                    ))
            );
        }

        return PageResponse.<CourseResponse>builder()
                .items(coursePage.getContent().stream().map(courseMapper::toResponse).toList())
                .page(page)
                .size(size)
                .totalPages(coursePage.getTotalPages())
                .totalElements(coursePage.getTotalElements())
                .statusCounts(statusCounts)
                .build();
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<AdminCourseReviewItemResponse> getAdminCourseReviews(
            int page,
            int size,
            String keyword,
            CourseStatus status,
            UUID categoryId,
            String instructor,
            String sortBy
    ) {
        Specification<Course> baseSpecification = buildAdminCourseReviewSpecification(
                keyword,
                categoryId,
                instructor
        );
        Specification<Course> specification = status == null
                ? baseSpecification
                : baseSpecification.and((root, query, cb) -> cb.equal(root.get("status"), status));

        Pageable pageable = PageRequest.of(page, size, resolveAdminCourseReviewSort(sortBy));
        Page<Course> coursePage = courseRepository.findAll(specification, pageable);

        Map<String, Long> statusCounts = new LinkedHashMap<>();
        statusCounts.put("ALL", courseRepository.count(baseSpecification));
        List<CourseStatus> reviewStatuses = List.of(
                CourseStatus.PENDING_REVIEW,
                CourseStatus.PUBLISHED,
                CourseStatus.REJECTED
        );
        reviewStatuses.forEach(courseStatus -> statusCounts.put(
                courseStatus.name(),
                courseRepository.count(baseSpecification.and(
                        (root, query, cb) -> cb.equal(root.get("status"), courseStatus)
                ))
        ));

        return PageResponse.<AdminCourseReviewItemResponse>builder()
                .items(coursePage.getContent().stream().map(this::toAdminCourseReviewItem).toList())
                .page(page)
                .size(size)
                .totalPages(coursePage.getTotalPages())
                .totalElements(coursePage.getTotalElements())
                .statusCounts(statusCounts)
                .build();
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional(readOnly = true)
    public AdminCourseReviewDetailResponse getAdminCourseReviewDetail(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return AdminCourseReviewDetailResponse.builder()
                .course(courseMapper.toResponse(course))
                .checklist(buildPublishChecklist(course))
                .curriculum(buildAdminCurriculum(course))
                .reviewHistory(getCourseReviewHistory(courseId))
                .build();
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public CourseResponse approveCourseReview(UUID courseId) {
        User reviewer = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != CourseStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.COURSE_REVIEW_INVALID_STATUS);
        }

        CoursePublishChecklistResponse checklist = buildPublishChecklist(course);
        if (!Boolean.TRUE.equals(checklist.getReady())) {
            throw new AppException(ErrorCode.COURSE_NOT_FULLY_COMPLETED);
        }

        CourseStatus fromStatus = course.getStatus();
        course.setStatus(CourseStatus.PUBLISHED);
        if (course.getPublishedAt() == null) {
            course.setPublishedAt(Instant.now());
        }
        course.setLastUpdatedContent(Instant.now());

        saveReviewHistory(course, reviewer, CourseReviewAction.APPROVED, fromStatus, CourseStatus.PUBLISHED, null);
        kafkaTemplate.send("course.published", course.getId().toString());

        return courseMapper.toResponse(course);
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN')")
    @Transactional
    public CourseResponse rejectCourseReview(UUID courseId, CourseRejectRequest request) {
        User reviewer = getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        String reason = request == null ? null : request.getReason();

        if (course.getStatus() != CourseStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.COURSE_REVIEW_INVALID_STATUS);
        }

        if (isBlank(reason)) {
            throw new AppException(ErrorCode.REVIEW_REASON_REQUIRED);
        }

        CourseStatus fromStatus = course.getStatus();
        course.setStatus(CourseStatus.REJECTED);
        course.setLastUpdatedContent(Instant.now());

        saveReviewHistory(course, reviewer, CourseReviewAction.REJECTED, fromStatus, CourseStatus.REJECTED, reason.trim());

        return courseMapper.toResponse(course);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Transactional(readOnly = true)
    public CoursePublishChecklistResponse getPublishChecklist(UUID courseId) {
        Course course = getAuthorizedCourse(courseId);
        return buildPublishChecklist(course);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Transactional(readOnly = true)
    public List<CourseReviewHistoryResponse> getReviewHistory(UUID courseId) {
        getAuthorizedCourse(courseId);
        return getCourseReviewHistory(courseId);
    }

    private CoursePublishChecklistResponse buildPublishChecklist(Course course) {
        UUID courseId = course.getId();
        List<CourseSection> sections = courseSectionRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        List<Lecture> lectures = lectureRepository.findByCourseIdOrderBySectionAndDisplayOrder(courseId);
        List<CoursePublishChecklistResponse.Group> groups = new ArrayList<>();

        groups.add(buildCourseInfoGroup(course));
        groups.add(buildCurriculumGroup(course, sections, lectures));
        groups.add(buildQuizGroup(course, lectures));
        groups.add(buildPricingGroup(course));

        boolean ready = groups.stream()
                .flatMap(group -> group.getItems().stream())
                .noneMatch(item -> FAILED.equals(item.getStatus()));

        return CoursePublishChecklistResponse.builder()
                .courseId(courseId)
                .ready(ready)
                .groups(groups)
                .build();
    }

    @Override
    @PreAuthorize("hasAnyAuthority('INSTRUCTOR', 'ADMIN')")
    @Transactional
    public CourseResponse submitForReview(UUID courseId) {
        User reviewer = getCurrentUser();
        Course course = getAuthorizedCourse(courseId);
        CoursePublishChecklistResponse checklist = getPublishChecklist(courseId);
        CourseStatus fromStatus = course.getStatus();

        if (course.getStatus() == CourseStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.COURSE_ALREADY_SUBMITTED);
        }

        if (course.getStatus() == CourseStatus.PUBLISHED) {
            throw new AppException(ErrorCode.COURSE_ALREADY_PUBLISHED);
        }

        if (!Boolean.TRUE.equals(checklist.getReady())) {
            throw new AppException(ErrorCode.COURSE_NOT_FULLY_COMPLETED);
        }

        course.setStatus(CourseStatus.PENDING_REVIEW);
        course.setLastUpdatedContent(Instant.now());
        saveReviewHistory(
                course,
                reviewer,
                fromStatus == CourseStatus.REJECTED ? CourseReviewAction.RESUBMITTED : CourseReviewAction.SUBMITTED,
                fromStatus,
                CourseStatus.PENDING_REVIEW,
                null
        );

        return courseMapper.toResponse(course);
    }

    private Course getAuthorizedCourse(UUID courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (user.getRole() != UserRole.ADMIN && !user.getId().equals(course.getInstructor().getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return course;
    }

    private CoursePublishChecklistResponse.Group buildCourseInfoGroup(Course course) {
        List<CoursePublishChecklistResponse.Item> items = new ArrayList<>();

        addRequiredCourseItem(items, course, "COURSE_TITLE", course.getTitle(), "Course title is required.");
        addRequiredCourseItem(items, course, "COURSE_DESCRIPTION", course.getDescription(), "Course description is required.");

        if (course.getCategory() == null) {
            items.add(checklistItem("COURSE_CATEGORY", FAILED, "Course category is required.", "COURSE_BASIC_INFO", course.getId()));
        }

        if (course.getLevel() == null) {
            items.add(checklistItem("COURSE_LEVEL", FAILED, "Course level is required.", "COURSE_BASIC_INFO", course.getId()));
        }

        addRequiredCourseItem(items, course, "COURSE_LANGUAGE", course.getLanguage(), "Course language is required.");
        addRequiredCourseItem(items, course, "COURSE_THUMBNAIL", course.getThumbnailUrl(), "Course thumbnail is required.");

        if (items.isEmpty()) {
            items.add(checklistItem("COURSE_INFO_COMPLETE", PASSED, "Course information is complete.", "COURSE_BASIC_INFO", course.getId()));
        }

        return checklistGroup("COURSE_INFO", "Course information", items);
    }

    private CoursePublishChecklistResponse.Group buildCurriculumGroup(
            Course course,
            List<CourseSection> sections,
            List<Lecture> lectures
    ) {
        List<CoursePublishChecklistResponse.Item> items = new ArrayList<>();

        if (sections.isEmpty()) {
            items.add(checklistItem("NO_SECTIONS", FAILED, "Add at least one section.", "SECTIONS", course.getId()));
        }

        if (lectures.isEmpty()) {
            items.add(checklistItem("NO_LECTURES", FAILED, "Add at least one lecture.", "LECTURES", course.getId()));
        }

        sections.stream()
                .filter(section -> lectures.stream().noneMatch(lecture -> lecture.getSection().getId().equals(section.getId())))
                .forEach(section -> items.add(checklistItem(
                        "EMPTY_SECTION",
                        FAILED,
                        "Section \"" + section.getTitle() + "\" needs at least one lecture.",
                        "SECTION",
                        section.getId()
                )));

        lectures.forEach(lecture -> addLectureReadinessItems(items, lecture));

        if (items.isEmpty()) {
            items.add(checklistItem("CURRICULUM_COMPLETE", PASSED, "Curriculum is ready.", "LECTURES", course.getId()));
        }

        return checklistGroup("CURRICULUM", "Curriculum", items);
    }

    private CoursePublishChecklistResponse.Group buildQuizGroup(Course course, List<Lecture> lectures) {
        List<CoursePublishChecklistResponse.Item> items = new ArrayList<>();
        List<Lecture> quizLectures = lectures.stream()
                .filter(lecture -> lecture.getContentType() == ContentType.QUIZ)
                .toList();

        quizLectures.forEach(lecture -> {
            Quiz quiz = lecture.getQuiz();
            if (quiz == null) {
                items.add(checklistItem(
                        "QUIZ_CONFIG_MISSING",
                        FAILED,
                        "Quiz lecture \"" + lecture.getTitle() + "\" needs quiz configuration.",
                        "LECTURE_PREVIEW",
                        lecture.getId()
                ));
                return;
            }

            int questionCount = quiz.getQuestions() == null ? 0 : quiz.getQuestions().size();
            if (questionCount == 0) {
                items.add(checklistItem(
                        "QUIZ_QUESTIONS_MISSING",
                        FAILED,
                        "Quiz \"" + lecture.getTitle() + "\" needs at least one question.",
                        "LECTURE_PREVIEW",
                        lecture.getId()
                ));
            }

            if (!Boolean.TRUE.equals(quiz.getIsPublished())) {
                items.add(checklistItem(
                        "QUIZ_UNPUBLISHED",
                        WARNING,
                        "Quiz \"" + lecture.getTitle() + "\" is currently unpublished.",
                        "LECTURE_PREVIEW",
                        lecture.getId()
                ));
            }
        });

        if (items.isEmpty()) {
            items.add(checklistItem("QUIZ_READY", PASSED, "Quiz content is ready.", "QUIZ", course.getId()));
        }

        return checklistGroup("QUIZ", "Quiz readiness", items);
    }

    private CoursePublishChecklistResponse.Group buildPricingGroup(Course course) {
        List<CoursePublishChecklistResponse.Item> items = new ArrayList<>();
        BigDecimal price = course.getPrice() == null ? BigDecimal.ZERO : course.getPrice();

        if (Boolean.TRUE.equals(course.getIsFree()) && price.compareTo(BigDecimal.ZERO) != 0) {
            items.add(checklistItem("FREE_PRICE_NOT_ZERO", FAILED, "Free courses must have price set to 0.", "COURSE_BASIC_INFO", course.getId()));
        } else if (!Boolean.TRUE.equals(course.getIsFree()) && price.compareTo(BigDecimal.ZERO) <= 0) {
            items.add(checklistItem("PAID_PRICE_MISSING", FAILED, "Paid courses need a price greater than 0.", "COURSE_BASIC_INFO", course.getId()));
        } else {
            items.add(checklistItem("PRICING_READY", PASSED, "Pricing is ready.", "COURSE_BASIC_INFO", course.getId()));
        }

        return checklistGroup("PRICING", "Pricing", items);
    }

    private void addLectureReadinessItems(List<CoursePublishChecklistResponse.Item> items, Lecture lecture) {
        if (isBlank(lecture.getTitle())) {
            items.add(checklistItem("LECTURE_TITLE_MISSING", FAILED, "A lecture title is required.", "LECTURE", lecture.getId()));
        }

        if (!Boolean.TRUE.equals(lecture.getIsPublished())) {
            items.add(checklistItem(
                    "LECTURE_UNPUBLISHED",
                    WARNING,
                    "Lecture \"" + lecture.getTitle() + "\" is currently unpublished.",
                    "LECTURE",
                    lecture.getId()
            ));
        }

        if (lecture.getContentType() == ContentType.ARTICLE && isBlank(lecture.getTextContent())) {
            items.add(checklistItem(
                    "ARTICLE_CONTENT_MISSING",
                    FAILED,
                    "Article lecture \"" + lecture.getTitle() + "\" needs content.",
                    "LECTURE_PREVIEW",
                    lecture.getId()
            ));
        }

        if (lecture.getContentType() == ContentType.VIDEO && isBlank(lecture.getVideoFileName())) {
            items.add(checklistItem(
                    "VIDEO_CONTENT_MISSING",
                    FAILED,
                    "Video lecture \"" + lecture.getTitle() + "\" needs a video file or URL.",
                    "LECTURE_PREVIEW",
                    lecture.getId()
            ));
        }

        if (lecture.getContentType() == ContentType.FILE
                && (lecture.getAttachments() == null || lecture.getAttachments().isEmpty())) {
            items.add(checklistItem(
                    "FILE_CONTENT_MISSING",
                    FAILED,
                    "File lecture \"" + lecture.getTitle() + "\" needs at least one attachment.",
                    "LECTURE_PREVIEW",
                    lecture.getId()
            ));
        }

        if (lecture.getContentType() == ContentType.EXTERNAL_LINK && isBlank(lecture.getExternalUrl())) {
            items.add(checklistItem(
                    "EXTERNAL_LINK_MISSING",
                    FAILED,
                    "External link lecture \"" + lecture.getTitle() + "\" needs a URL.",
                    "LECTURE_PREVIEW",
                    lecture.getId()
            ));
        }
    }

    private void addRequiredCourseItem(
            List<CoursePublishChecklistResponse.Item> items,
            Course course,
            String key,
            String value,
            String message
    ) {
        if (isBlank(value)) {
            items.add(checklistItem(key, FAILED, message, "COURSE_BASIC_INFO", course.getId()));
        }
    }

    private CoursePublishChecklistResponse.Group checklistGroup(
            String key,
            String label,
            List<CoursePublishChecklistResponse.Item> items
    ) {
        return CoursePublishChecklistResponse.Group.builder()
                .key(key)
                .label(label)
                .items(items)
                .build();
    }

    private CoursePublishChecklistResponse.Item checklistItem(
            String key,
            String status,
            String message,
            String targetType,
            UUID targetId
    ) {
        return CoursePublishChecklistResponse.Item.builder()
                .key(key)
                .status(status)
                .message(message)
                .targetType(targetType)
                .targetId(targetId)
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private CourseCurriculumResponse buildAdminCurriculum(Course course) {
        UUID courseId = course.getId();
        List<CourseSection> sections = courseSectionRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        List<Lecture> lectures = lectureRepository.findByCourseIdOrderBySectionAndDisplayOrder(courseId);

        List<CourseCurriculumResponse.SectionItem> sectionItems = sections.stream()
                .map(section -> {
                    List<CourseCurriculumResponse.LectureItem> lectureItems = lectures.stream()
                            .filter(lecture -> lecture.getSection().getId().equals(section.getId()))
                            .map(this::toAdminLectureItem)
                            .toList();

                    return CourseCurriculumResponse.SectionItem.builder()
                            .id(section.getId())
                            .title(section.getTitle())
                            .description(section.getDescription())
                            .displayOrder(section.getDisplayOrder())
                            .durationMinutes(section.getDurationMinutes())
                            .lectures(lectureItems)
                            .build();
                })
                .toList();

        int totalDuration = sectionItems.stream()
                .mapToInt(section -> section.getDurationMinutes() == null ? 0 : section.getDurationMinutes())
                .sum();

        return CourseCurriculumResponse.builder()
                .courseId(courseId)
                .totalSections(sectionItems.size())
                .totalLectures(lectures.size())
                .totalDurationMinutes(totalDuration)
                .sections(sectionItems)
                .build();
    }

    private CourseCurriculumResponse.LectureItem toAdminLectureItem(Lecture lecture) {
        Quiz quiz = lecture.getQuiz();

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
                .completed(false)
                .status(Boolean.TRUE.equals(lecture.getIsPublished()) ? "PUBLISHED" : "UNPUBLISHED")
                .quiz(quiz == null ? null : CourseCurriculumResponse.QuizItem.builder()
                        .id(quiz.getId())
                        .title(quiz.getTitle())
                        .description(quiz.getDescription())
                        .timeLimitMinutes(quiz.getTimeLimitMinutes())
                        .totalQuestions(quiz.getTotalQuestions())
                        .completed(false)
                        .status(Boolean.TRUE.equals(quiz.getIsPublished()) ? "PUBLISHED" : "UNPUBLISHED")
                        .build())
                .build();
    }

    private List<CourseReviewHistoryResponse> getCourseReviewHistory(UUID courseId) {
        return courseReviewHistoryRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(this::toReviewHistoryResponse)
                .toList();
    }

    private CourseReviewHistoryResponse toReviewHistoryResponse(CourseReviewHistory history) {
        return CourseReviewHistoryResponse.builder()
                .id(history.getId())
                .courseId(history.getCourse().getId())
                .reviewer(userMapper.toResponse(history.getReviewer()))
                .action(history.getAction())
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
    }

    private void saveReviewHistory(
            Course course,
            User reviewer,
            CourseReviewAction action,
            CourseStatus fromStatus,
            CourseStatus toStatus,
            String reason
    ) {
        courseReviewHistoryRepository.save(CourseReviewHistory.builder()
                .course(course)
                .reviewer(reviewer)
                .action(action)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .build());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private int toMinutes(Integer seconds) {
        if (seconds == null || seconds <= 0) {
            return 0;
        }

        return (int) Math.ceil(seconds / 60.0);
    }

    private Specification<Course> buildAdminCourseReviewSpecification(
            String keyword,
            UUID categoryId,
            String instructor
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (instructor != null && !instructor.isBlank()) {
                String pattern = "%" + instructor.trim().toLowerCase() + "%";
                Join<Course, Instructor> instructorJoin = root.join("instructor", JoinType.LEFT);
                Join<Instructor, User> userJoin = instructorJoin.join("user", JoinType.LEFT);

                predicates.add(cb.or(
                        cb.like(cb.lower(userJoin.get("firstName")), pattern),
                        cb.like(cb.lower(userJoin.get("lastName")), pattern),
                        cb.like(cb.lower(userJoin.get("email")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort resolveAdminCourseReviewSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "lastUpdatedContent");
        }

        return switch (sortBy) {
            case "SUBMITTED_ASC" -> Sort.by(Sort.Direction.ASC, "lastUpdatedContent");
            case "UPDATED_DESC" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            case "UPDATED_ASC" -> Sort.by(Sort.Direction.ASC, "updatedAt");
            case "TITLE_ASC" -> Sort.by(Sort.Direction.ASC, "title");
            case "TITLE_DESC" -> Sort.by(Sort.Direction.DESC, "title");
            default -> Sort.by(Sort.Direction.DESC, "lastUpdatedContent");
        };
    }

    private AdminCourseReviewItemResponse toAdminCourseReviewItem(Course course) {
        CourseResponse courseResponse = courseMapper.toResponse(course);
        CoursePublishChecklistResponse checklist = buildPublishChecklist(course);
        int totalChecklistItems = checklist.getGroups().stream()
                .mapToInt(group -> group.getItems().size())
                .sum();
        int passedChecklistItems = checklist.getGroups().stream()
                .flatMap(group -> group.getItems().stream())
                .mapToInt(item -> PASSED.equals(item.getStatus()) ? 1 : 0)
                .sum();

        return AdminCourseReviewItemResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .instructor(courseResponse.getInstructor())
                .category(courseResponse.getCategory())
                .status(course.getStatus())
                .totalSections(toInt(courseSectionRepository.countByCourseId(course.getId())))
                .totalLectures(toInt(lectureRepository.countByCourseId(course.getId())))
                .totalQuizzes(toInt(lectureRepository.countByCourseIdAndContentType(course.getId(), ContentType.QUIZ)))
                .checklistReady(checklist.getReady())
                .checklistPassed(passedChecklistItems)
                .checklistTotal(totalChecklistItems)
                .submittedAt(course.getLastUpdatedContent())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    private int toInt(Long value) {
        return value == null ? 0 : value.intValue();
    }
}
