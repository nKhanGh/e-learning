package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;
import com.khangdev.elearningbe.dto.request.interaction.MessageSendRequest;
import com.khangdev.elearningbe.dto.response.interaction.MessageResponse;
import com.khangdev.elearningbe.service.ai.ChatBotService;
import com.khangdev.elearningbe.service.ai.CourseRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/ai")
public class AIController {
    private final ChatBotService chatBotService;
    private final CourseRecommendationService courseRecommendationService;

    @PostMapping("/chat")
    public ApiResponse<MessageResponse> chat (@RequestBody MessageSendRequest request){
        return ApiResponse.<MessageResponse>builder()
                .result(chatBotService.chat(request))
                .build();
    }

    @DeleteMapping("/chat/memory/{conversationId}")
    public ApiResponse<Void> clearConversationMemory(@PathVariable("conversationId") UUID conversationId){
        chatBotService.clearConversationMemory(conversationId);
        return ApiResponse.<Void>builder()
                .message("Clear conversation memory successfully!")
                .build();
    }

    @PostMapping("/recommendations/by-preferences")
    public ApiResponse<List<CourseRecommendationDTO>> recommendations (
            @RequestParam UUID userId,
            @RequestParam String preferences
    ){
        return ApiResponse.<List<CourseRecommendationDTO>>builder()
                .result(courseRecommendationService.recommendByUserPreferences(userId, preferences))
                .build();
    }

    @GetMapping("/recommendations/similar/{courseId}")
    public ApiResponse<List<CourseRecommendationDTO>> recommendSimilar(@PathVariable("courseId") UUID courseId){
        return ApiResponse.<List<CourseRecommendationDTO>>builder()
                .result(courseRecommendationService.recommendSimilarCourses(courseId))
                .build();
    }

    @GetMapping("/recommendations/beginners")
    public ApiResponse<List<CourseRecommendationDTO>> recommendForBeginners(
            @RequestParam String topic
    ) {
        return ApiResponse.<List<CourseRecommendationDTO>>builder()
                .result(courseRecommendationService.recommendForBeginners(topic))
                .build();
    }
}
