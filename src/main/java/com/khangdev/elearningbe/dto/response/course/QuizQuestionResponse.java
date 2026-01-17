package com.khangdev.elearningbe.dto.response.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private UUID id;
    private String questionText;
    private String explanation;
    private BigDecimal points;
    private Integer displayOrder;
    private List<String> options;
    private List<String> correctAnswers;
    private String imageUrl;
    private String videoUrl;
}
