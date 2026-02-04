package com.khangdev.elearningbe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.common.ReportHandleRequest;
import com.khangdev.elearningbe.dto.request.common.ReportRequest;
import com.khangdev.elearningbe.dto.response.common.ReportResponse;
import com.khangdev.elearningbe.enums.ReportStatus;
import com.khangdev.elearningbe.service.interaction.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    private ObjectMapper objectMapper;
    private ReportResponse reportResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        reportResponse = ReportResponse.builder()
                .id(UUID.randomUUID())
                .description("Report")
                .build();
    }

    @Test
    void createReport_success() throws Exception {
        UUID targetId = UUID.randomUUID();
        Mockito.when(reportService.createReport(ArgumentMatchers.eq(targetId), ArgumentMatchers.any()))
                .thenReturn(reportResponse);

        ReportRequest request = ReportRequest.builder()
                .description("Report")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.post("/reports/{targetId}", targetId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void searchReports_success() throws Exception {
        PageResponse<ReportResponse> pageResponse = PageResponse.<ReportResponse>builder()
                .items(List.of(reportResponse))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        Mockito.when(reportService.searchReport(ArgumentMatchers.any(), ArgumentMatchers.anyInt(),
                ArgumentMatchers.anyInt()))
                .thenReturn(pageResponse);

        mockMvc.perform(MockMvcRequestBuilders.get("/reports/search")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON_VALUE))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }

    @Test
    void handleReport_success() throws Exception {
        UUID reportId = UUID.randomUUID();
        Mockito.when(reportService.handleReport(ArgumentMatchers.eq(reportId), ArgumentMatchers.any()))
                .thenReturn(reportResponse);

        ReportHandleRequest request = ReportHandleRequest.builder()
                .status(ReportStatus.RESOLVED)
                .moderatorNotes("OK")
                .build();

        mockMvc.perform(MockMvcRequestBuilders.put("/reports/{reportId}", reportId)
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
    }
}