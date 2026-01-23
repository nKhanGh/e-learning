package com.khangdev.elearningbe.controller;

import com.khangdev.elearningbe.dto.ApiResponse;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.common.ReportHandleRequest;
import com.khangdev.elearningbe.dto.request.common.ReportRequest;
import com.khangdev.elearningbe.dto.request.common.ReportSearchRequest;
import com.khangdev.elearningbe.dto.response.common.ReportResponse;
import com.khangdev.elearningbe.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/{targetId}")
    ApiResponse<ReportResponse> createReport(@PathVariable UUID targetId, @RequestBody ReportRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.createReport(targetId, request))
                .build();
    }
    @GetMapping("/search")
    ApiResponse<PageResponse<ReportResponse>> searchReports(
            ReportSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<ReportResponse>>builder()
                .result(reportService.searchReport(request, page, size))
                .build();
    }

    @PutMapping("/{reportId}")
    ApiResponse<ReportResponse> handleReport(@PathVariable UUID reportId, @RequestBody ReportHandleRequest request) {
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.handleReport(reportId, request))
                .build();
    }
}
