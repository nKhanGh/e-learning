package com.khangdev.elearningbe.dto.request.common;

import com.khangdev.elearningbe.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportHandleRequest {
    ReportStatus status;
    String moderatorNotes;
}
