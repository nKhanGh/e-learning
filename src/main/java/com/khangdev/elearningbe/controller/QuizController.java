package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.service.LectureService;
import com.khangdev.elearningbe.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/quizzes")
public class QuizController {
    private final QuizService quizService;

    @PostMapping
    ApiResponse<QuizResponse> createQuiz(@RequestBody QuizRequest quizRequest){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.createQuiz(quizRequest))
                .build();
    }

    @PutMapping("/{quizId}")
    ApiResponse<QuizResponse> updateQuiz(@PathVariable UUID quizId, @RequestBody QuizUpdateRequest request){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.updateQuiz(quizId, request))
                .build();
    }

    @GetMapping("/lecture/{lectureId}")
    ApiResponse<QuizResponse> getByLectureId(@PathVariable UUID lectureId){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.getByLectureId(lectureId))
                .build();
    }

    @GetMapping("/public/lecture/{lectureId}")
    ApiResponse<QuizResponse> getPublicQuizByLectureId(@PathVariable UUID lectureId){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.getPublicQuizByLectureId(lectureId))
                .build();
    }

    @GetMapping("/{quizId}")
    ApiResponse<QuizResponse> getQuizById(@PathVariable UUID quizId){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.getByQuizId(quizId))
                .build();
    }

    @GetMapping("/public/{quizId}")
    ApiResponse<QuizResponse> getPublicQuizByQuizId(@PathVariable UUID quizId){
        return ApiResponse.<QuizResponse>builder()
                .result(quizService.getPublicQuizByQuizId(quizId))
                .build();
    }

    @DeleteMapping("/{quizId}")
    ApiResponse<Void> deleteById(@PathVariable UUID quizId){
        quizService.deleteById(quizId);
        return ApiResponse.<Void>builder()
                .message("Quiz delete successfully!")
                .build();
    }

}
