package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.response.interaction.MessageReactionResponse;
import com.khangdev.elearningbe.enums.ReactionType;
import com.khangdev.elearningbe.service.interaction.MessageReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/messages")
public class MessageReactionController {
    private final MessageReactionService  messageReactionService;

    @PostMapping("/{messageId}/reaction")
    public ApiResponse<MessageReactionResponse> reaction(
            @PathVariable UUID messageId,
            @RequestParam ReactionType reaction)
    {
        return ApiResponse.<MessageReactionResponse>builder()
                .result(messageReactionService.react(messageId, reaction))
                .build();
    }

    @GetMapping("/{messageId}/reaction")
    public ApiResponse<List<MessageReactionResponse>> getReaction(@PathVariable UUID messageId){
        return ApiResponse.<List<MessageReactionResponse>>builder()
                .result(messageReactionService.getReactions(messageId))
                .build();
    }
}
