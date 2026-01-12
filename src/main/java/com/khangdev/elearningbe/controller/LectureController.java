package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.LectureRequest;
import com.khangdev.elearningbe.dto.request.course.LectureUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.LectureResponse;
import com.khangdev.elearningbe.service.LectureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lectures")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;

    @GetMapping("/section/{sectionId}")
    ApiResponse<List<LectureResponse>> getLecturesBySectionId(@PathVariable UUID sectionId){
        return ApiResponse.<List<LectureResponse>>builder()
                .result(lectureService.getLecturesBySectionId(sectionId))
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
}
