package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.course.CourseCreationRequest;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.request.course.CourseUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.CourseResponse;
import com.khangdev.elearningbe.dto.response.course.CourseSearchResponse;
import com.khangdev.elearningbe.service.course.CourseIndex;
import com.khangdev.elearningbe.service.course.CourseSearchService;
import com.khangdev.elearningbe.service.course.CourseService;
import com.khangdev.elearningbe.service.user.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/courses")
public class CourseController {
    CourseService courseService;
    CourseIndex indexer;
    CourseSearchService searchService;
    UserService userService;

    @PostMapping
    ApiResponse<CourseResponse> createCourse(@RequestBody CourseCreationRequest request){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.createCourse(request))
                .build();
    }

//    @GetMapping("/search")
//    ApiResponse<PageResponse<CourseResponse>> searchCourses(
//            CourseSearchRequest request,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "9") int size
//    ) throws JsonProcessingException {
//        return ApiResponse.<PageResponse<CourseResponse>>builder()
//                .result(courseService.searchCourse(request, page, size))
//                .build();
//    }

//    @PostMapping("/search")
//    public ApiResponse<CourseSearchResponse.Page> search(@RequestBody CourseSearchRequest request){
//        CourseSearchResponse.Page page = searchService.search(request);
//
//        boolean fromCache = page.getSearchInfo() != null
//                && page.getSearchInfo().isFromCache();
//        return ApiResponse.<CourseSearchResponse.Page>builder()
//                .result(page)
//                .build();
//    }

    @PostMapping("/search")
    public ResponseEntity<CourseSearchResponse.Page> search(
            @Valid @RequestBody CourseSearchRequest request) {

        CourseSearchResponse.Page page = searchService.search(request);

        boolean fromCache = page.getSearchInfo() != null
                && Boolean.TRUE.equals(page.getSearchInfo().isFromCache());

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.SECONDS).cachePrivate())
                .header("X-Cache", fromCache ? "HIT" : "MISS")
                .body(page);
    }

    @PostMapping("/admin/reindex")
    public ApiResponse<Void> reindex() {
        indexer.fullReindex();
        return ApiResponse
                .<Void>builder()
                .message("Course indexing successfully")
                .build();
    }

    @PutMapping("/{courseId}")
    ApiResponse<CourseResponse> updateCourse(@PathVariable UUID courseId, @RequestBody CourseUpdateRequest request){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.updateCourse(courseId, request))
                .build();
    }

    @GetMapping("/{courseId}")
    ApiResponse<CourseResponse> getCourse(@PathVariable UUID courseId){
        return ApiResponse.<CourseResponse>builder()
                .result(courseService.getCourseById(courseId))
                .build();
    }

    @DeleteMapping("/{courseId}")
    ApiResponse<Void> deleteCourse(@PathVariable UUID courseId){
        courseService.deleteCourse(courseId);
        return ApiResponse.<Void>builder()
                .message("Course deleted successfully!")
                .build();
    }

    @GetMapping("/my-course")
    ApiResponse<PageResponse<CourseResponse>> getMyCourse(
            @RequestParam(defaultValue = "9", required = false) int page,
            @RequestParam(defaultValue = "0", required = false) int size
    ){
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<PageResponse<CourseResponse>>builder()
                .result(courseService.getCourses(userId, page, size))
                .build();
    }

    @GetMapping("/instructor/{instructorId}")
    ApiResponse<PageResponse<CourseResponse>> getInstructorCourse(
            @PathVariable UUID instructorId,
            @RequestParam(defaultValue = "9", required = false) int page,
            @RequestParam(defaultValue = "0", required = false) int size
    ){
        return ApiResponse.<PageResponse<CourseResponse>>builder()
                .result(courseService.getCourses(instructorId, page, size))
                .build();
    }

}
