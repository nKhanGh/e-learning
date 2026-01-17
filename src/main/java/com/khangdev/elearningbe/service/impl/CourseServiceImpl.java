package com.khangdev.elearningbe.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.entity.course.CourseTag;
import com.khangdev.elearningbe.entity.user.Instructor;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.mapper.UserMapper;
import com.khangdev.elearningbe.repository.CourseCategoryRepository;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.CourseTagRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.CourseService;
import com.khangdev.elearningbe.service.CourseTagService;
import com.khangdev.elearningbe.service.RedisService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseServiceImpl implements CourseService {
    CourseRepository courseRepository;
    CourseMapper courseMapper;
    UserRepository userRepository;
    CourseCategoryRepository courseCategoryRepository;
    CourseTagRepository courseTagRepository;
    CourseTagService courseTagService;
    ObjectMapper objectMapper;

    UserMapper userMapper;
    RedisService redisService;

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

        CourseResponse result =  courseMapper.toResponse(course);
        result.setInstructor(userMapper.toResponse(user));
        return result;
    }

    @Override
    public CourseResponse updateCourse(UUID courseId, CourseUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user =  userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(user.getRole() != UserRole.ADMIN && user.getId() != course.getInstructor().getId())
            throw new AppException(ErrorCode.UNAUTHORIZED);

        courseMapper.updateCourse(course, request);
        courseRepository.save(course);
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

            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }

            if (request.getMaxPrice() != null) {
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
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Specification<Course> keywordSpec = null;
        if (request.getKeyword() != null && !request.getKeyword().isBlank()){
            String keyword = "%" + request.getKeyword().trim().toLowerCase() + "%";
            keywordSpec = (root, query, cb) -> {
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
}
