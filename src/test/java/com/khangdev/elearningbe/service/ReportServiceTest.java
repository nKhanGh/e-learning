package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.common.ReportRequest;
import com.khangdev.elearningbe.dto.response.common.ReportResponse;
import com.khangdev.elearningbe.dto.response.user.UserResponse;
import com.khangdev.elearningbe.entity.common.Report;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReportReason;
import com.khangdev.elearningbe.enums.ReportTargetType;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ReportMapper;
import com.khangdev.elearningbe.repository.CommentRepository;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.ReportRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.interaction.ReportService;
import com.khangdev.elearningbe.service.user.UserService;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @MockBean
    private ReportRepository reportRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private CourseRepository courseRepository;

    @MockBean
    private CommentRepository commentRepository;

    @MockBean
    private ReportMapper reportMapper;

    @MockBean
    private UserService userService;

    @Test
    void createReport_success() {
        UUID reporterId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(reporterId).build();
        User user = User.builder().id(reporterId).build();
        Course course = Course.builder().id(targetId).build();
        ReportResponse response = ReportResponse.builder().id(UUID.randomUUID()).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(courseRepository.findById(targetId)).thenReturn(Optional.of(course));
        Mockito.when(userRepository.findById(reporterId)).thenReturn(Optional.of(user));
        Mockito.when(reportMapper.toResponse(ArgumentMatchers.any())).thenReturn(response);

        ReportRequest request = ReportRequest.builder()
                .targetType(ReportTargetType.COURSE)
                .reason(ReportReason.SPAM)
                .description("Spam")
                .build();

        ReportResponse result = reportService.createReport(targetId, request);

        Assertions.assertThat(result).isNotNull();
        Mockito.verify(reportRepository).save(ArgumentMatchers.any());
    }

    @Test
    void handleReport_notAdmin_throwException() {
        UUID userId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();
        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.INSTRUCTOR).build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        Assertions.assertThatThrownBy(() -> reportService.handleReport(reportId, null))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.UNAUTHORIZED);
    }

    @Test
    @WithMockUser(username = "khang", authorities = {"ADMIN"})
    void searchReport_success() {
        Report report = Report.builder().id(UUID.randomUUID()).build();
        var pageResponse = com.khangdev.elearningbe.dto.PageResponse.<ReportResponse>builder()
                .items(java.util.List.of(ReportResponse.builder().build()))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        Page<Report> reportPage = new PageImpl<>(List.of(report), PageRequest.of(0, 10), 1);

        Mockito.when(reportRepository.findAll(
                ArgumentMatchers.any(Specification.class),
                ArgumentMatchers.any(Pageable.class)
                )).thenReturn(reportPage);
        Mockito.when(reportMapper.toResponse(ArgumentMatchers.any())).thenReturn(ReportResponse.builder().build());

        var result = reportService
                .searchReport(com.khangdev.elearningbe.dto.request.common.ReportSearchRequest.builder().build(), 0, 10);

        Assertions.assertThat(result.getItems()).hasSize(1);
    }

    @Test
    void handleReport_success() {
        UUID userId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();

        UserResponse userResponse = UserResponse.builder().id(userId).build();
        User user = User.builder().id(userId).role(UserRole.ADMIN).build();
        com.khangdev.elearningbe.entity.common.Report report = com.khangdev.elearningbe.entity.common.Report.builder()
                .build();

        Mockito.when(userService.getMyInfo()).thenReturn(userResponse);
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        Mockito.when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));
        Mockito.when(reportMapper.toResponse(report)).thenReturn(ReportResponse.builder().build());

        var result = reportService.handleReport(reportId,
                com.khangdev.elearningbe.dto.request.common.ReportHandleRequest.builder()
                        .status(com.khangdev.elearningbe.enums.ReportStatus.RESOLVED)
                        .moderatorNotes("ok")
                        .build());

        Assertions.assertThat(result).isNotNull();
    }
}