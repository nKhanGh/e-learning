package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.request.course.NoteRequest;
import com.khangdev.elearningbe.dto.response.LectureProgressResponse;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.dto.response.course.PublicLectureResponse;
import com.khangdev.elearningbe.service.course.LectureProgressService;
import com.khangdev.elearningbe.service.course.LectureService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lectures")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;
    private final LectureProgressService  lectureProgressService;
    private final UserService userService;

    @GetMapping("/section/{sectionId}")
    ApiResponse<List<LectureResponse>> getLecturesBySectionId(@PathVariable UUID sectionId){
        return ApiResponse.<List<LectureResponse>>builder()
                .result(lectureService.getLecturesBySectionId(sectionId))
                .build();
    }

    @GetMapping("/section/{sectionId}/general")
    ApiResponse<List<PublicLectureResponse>> getGeneralLecturesBySectionId(@PathVariable UUID sectionId){
        return ApiResponse.<List<PublicLectureResponse>>builder()
                .result(lectureService.getGeneralLecturesBySectionId(sectionId))
                .build();
    }

    @GetMapping("/public/section/{sectionId}")
    ApiResponse<List<LectureResponse>> getPublicLecturesBySectionId(@PathVariable UUID sectionId){
        return ApiResponse.<List<LectureResponse>>builder()
                .result(lectureService.getPublicLecturesBySectionId(sectionId))
                .build();
    }

    @GetMapping("/{lectureId}")
    ApiResponse<LectureResponse> getByLectureId(@PathVariable  UUID lectureId){
        return ApiResponse.<LectureResponse>builder()
                .result(lectureService.getByLectureId(lectureId))
                .build();
    }

    @GetMapping("/public/{lectureId}")
    ApiResponse<LectureResponse> getPublicLectureByLectureId(@PathVariable UUID lectureId){
        return ApiResponse.<LectureResponse>builder()
                .result(lectureService.getPublicLectureByLectureId(lectureId))
                .build();
    }

    @PostMapping
    ApiResponse<LectureResponse> createLecture(@RequestBody LectureRequest lectureRequest){
        return ApiResponse.<LectureResponse>builder()
                .result(lectureService.createLecture(lectureRequest))
                .build();
    }

    @PutMapping("/{lectureId}")
    ApiResponse<LectureResponse> updateLecture(@PathVariable UUID lectureId, @RequestBody LectureUpdateRequest request){
        return ApiResponse.<LectureResponse>builder()
                .result(lectureService.updateLecture(lectureId, request))
                .build();
    }

    @DeleteMapping("/{lectureId}")
    ApiResponse<Void> deleteByLectureId(@PathVariable UUID lectureId){
        lectureService.deleteByLectureId(lectureId);
        return ApiResponse.<Void>builder()
                .message("Lecture deleted complete!")
                .build();
    }

    @PostMapping("/{lectureId}/progress")
    ApiResponse<LectureProgressResponse> createProgress(@PathVariable UUID lectureId){
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.createLectureProgress(lectureId))
                .build();
    }

    @PostMapping("/{lectureId}/progress/completion")
    ApiResponse<LectureProgressResponse> markAsCompleted(@PathVariable UUID lectureId){
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.markAsCompleted(lectureId))
                .build();
    }

    @GetMapping("/{lectureId}/progress")
    ApiResponse<LectureProgressResponse> getMyProgress(@PathVariable UUID lectureId){
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.getProgress(userId, lectureId))
                .build();
    }

    @GetMapping("/{lectureId}/users/{userId}/progress")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    ApiResponse<LectureProgressResponse> getProgress(@PathVariable UUID userId, @PathVariable UUID lectureId){
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.getProgress(userId, lectureId))
                .build();
    }

    @GetMapping("/courses/{courseId}/progress")
    ApiResponse<List<LectureProgressResponse>> getMyCourseLectureProgress(@PathVariable UUID courseId){
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<List<LectureProgressResponse>>builder()
                .result(lectureProgressService.getCourseProgress(userId, courseId))
                .build();
    }

    @GetMapping("/courses/{courseId}/users/{userId}/progresses")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    ApiResponse<List<LectureProgressResponse>> getCourseLectureProgress(@PathVariable UUID userId, @PathVariable UUID courseId){
        return ApiResponse.<List<LectureProgressResponse>>builder()
                .result(lectureProgressService.getCourseProgress(userId, courseId))
                .build();
    }

    @PutMapping("/{lectureId}/progress/bookmark")
    ApiResponse<LectureProgressResponse> toggleBookmark(@PathVariable UUID lectureId){
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.toggleBookmark(lectureId))
                .build();
    }

    @GetMapping("/bookmarks")
    ApiResponse<List<LectureProgressResponse>> getBookmarks(){
        return ApiResponse.<List<LectureProgressResponse>>builder()
                .result(lectureProgressService.getBookmarkedLectures())
                .build();
    }

    @PutMapping("/{lectureId}/progress/note")
    ApiResponse<LectureProgressResponse> addNote(
            @PathVariable UUID lectureId,
            @RequestBody NoteRequest note
    ){
        return ApiResponse.<LectureProgressResponse>builder()
                .result(lectureProgressService.addNotes(lectureId, note))
                .build();
    }



}
