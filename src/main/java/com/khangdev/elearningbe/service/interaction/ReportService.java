package com.khangdev.elearningbe.service.interaction;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.common.ReportHandleRequest;
import com.khangdev.elearningbe.dto.request.common.ReportRequest;
import com.khangdev.elearningbe.dto.request.common.ReportSearchRequest;
import com.khangdev.elearningbe.dto.response.common.ReportResponse;

import java.util.UUID;

public interface ReportService {
    ReportResponse createReport(UUID targetId, ReportRequest reportRequest);
    PageResponse<ReportResponse> searchReport(ReportSearchRequest request, int page, int size);
    ReportResponse handleReport(UUID reportId, ReportHandleRequest request);
}
