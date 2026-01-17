package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionRequest;
import com.khangdev.elearningbe.dto.request.course.QuizQuestionUpdateRequest;
import com.khangdev.elearningbe.dto.response.course.QuizQuestionResponse;
import com.khangdev.elearningbe.service.QuizQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/quiz-questions")
public class QuizQuestionController {
    private final QuizQuestionService quizQuestionService;

    @GetMapping("/{quizId}")
    ApiResponse<List<QuizQuestionResponse>> findByQuizId(@PathVariable UUID quizId){
        return ApiResponse.<List<QuizQuestionResponse>>builder()
                .result(quizQuestionService.findByQuizId(quizId))
                .build();
    }

    @PostMapping
    ApiResponse<QuizQuestionResponse> createQuizQuestion(@RequestBody QuizQuestionRequest quizQuestionRequest){
        return ApiResponse.<QuizQuestionResponse>builder()
                .result(quizQuestionService.createQuizQuestion(quizQuestionRequest))
                .build();
    }

    @DeleteMapping("/{quizQuestionId}")
    ApiResponse<Void> deleteQuizQuestion(@PathVariable UUID quizQuestionId){
        quizQuestionService.deleteQuizQuestion(quizQuestionId);
        return ApiResponse.<Void>builder()
                .message("Quiz question delete successfully!")
                .build();
    }

    @PutMapping("/{quizQuestionId}")
    ApiResponse<QuizQuestionResponse> updateQuizQuestion(
            @PathVariable UUID quizQuestionId,
            @RequestBody QuizQuestionUpdateRequest request
    ){
        return ApiResponse.<QuizQuestionResponse>builder()
                .result(quizQuestionService.updateQuizQuestion(quizQuestionId, request))
                .build();
    }

}
