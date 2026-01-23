package com.khangdev.elearningbe.dto.request.common;

import com.khangdev.elearningbe.enums.ReportStatus;
import com.khangdev.elearningbe.enums.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSearchRequest {
    private Instant from;
    private Instant to;
    private String keyword;
    private ReportTargetType targetType;
    private ReportStatus status;
}
