package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.QuizRequest;
import com.khangdev.elearningbe.dto.request.course.QuizSubmitRequest;
import com.khangdev.elearningbe.dto.request.course.QuizUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizAttemptResponse;
import com.khangdev.elearningbe.dto.response.course.QuizResponse;
import com.khangdev.elearningbe.service.course.QuizAttemptService;
import com.khangdev.elearningbe.service.course.QuizService;
import com.khangdev.elearningbe.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/quizzes")
public class QuizController {
    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService;
    private final UserService userService;

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

    @PostMapping("/{quizId}/attempts")
    ApiResponse<QuizAttemptResponse> attemptQuiz(@PathVariable UUID quizId){
        return ApiResponse.<QuizAttemptResponse>builder()
                .result(quizAttemptService.attemptQuiz(quizId))
                .build();
    }

    @PutMapping("/{quizId}/submission")
    ApiResponse<QuizAttemptResponse> submit(@PathVariable UUID quizId, @RequestBody QuizSubmitRequest request){
        return ApiResponse.<QuizAttemptResponse>builder()
                .result(quizAttemptService.submitQuiz(quizId, request))
                .build();
    }

    @GetMapping("/{quizId}/users/{userId}/attempts/{attemptNumber}")
    @PreAuthorize("hasAuthority('INSTRUCTOR')")
    ApiResponse<QuizAttemptResponse> getUserAttempt(
            @PathVariable UUID userId,
            @PathVariable UUID quizId,
            @PathVariable Integer attemptNumber) {
        return ApiResponse.<QuizAttemptResponse>builder()
                .result(quizAttemptService.getAttempt(userId, quizId, attemptNumber))
                .build();
    }

    @GetMapping("/quizzes/{quizId}/attempts/{attemptNumber}")
    ApiResponse<QuizAttemptResponse> getMyAttempt(
            @PathVariable UUID quizId,
            @PathVariable Integer attemptNumber) {
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<QuizAttemptResponse>builder()
                .result(quizAttemptService.getAttempt(userId, quizId, attemptNumber))
                .build();
    }

    @GetMapping("/{quizId}/attempts")
    public ApiResponse<List<QuizAttemptResponse>> getMyAttempts(
            @PathVariable UUID quizId) {
        UUID userId = userService.getMyInfo().getId();
        return ApiResponse.<List<QuizAttemptResponse>>builder()
                .result(quizAttemptService.getAllAttempts(userId, quizId))
                .build();
    }

}
