package com.khangdev.elearningbe.dto.request.common;

import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReportReason;
import com.khangdev.elearningbe.enums.ReportStatus;
import com.khangdev.elearningbe.enums.ReportTargetType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private ReportTargetType targetType; // COURSE, COMMENT
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private UUID reviewedById;
    private Instant reviewedAt;
    private String moderatorNotes;
}
