package com.khangdev.elearningbe.dto.response.common;

import com.khangdev.elearningbe.dto.response.user.UserResponse;
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
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {
    private UUID id;
    private UserResponse reporter;
    private ReportTargetType targetType; // COURSE, COMMENT
    private UUID entityId;
    private ReportReason reason;
    private String description;
    private ReportStatus status = ReportStatus.PENDING;
    private UserResponse reviewedBy;
    private Instant reviewedAt;
    private String moderatorNotes;
}
