package com.khangdev.elearningbe.service.impl;

import com.khangdev.elearningbe.dto.PageResponse;
import com.khangdev.elearningbe.dto.request.common.ReportHandleRequest;
import com.khangdev.elearningbe.dto.request.common.ReportRequest;
import com.khangdev.elearningbe.dto.request.common.ReportSearchRequest;
import com.khangdev.elearningbe.dto.response.common.ReportResponse;
import com.khangdev.elearningbe.entity.common.Report;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.ReportStatus;
import com.khangdev.elearningbe.enums.ReportTargetType;
import com.khangdev.elearningbe.enums.UserRole;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.mapper.ReportMapper;
import com.khangdev.elearningbe.repository.CommentRepository;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.repository.ReportRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.ReportService;
import com.khangdev.elearningbe.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CourseRepository  courseRepository;
    private final CommentRepository  commentRepository;

    private final ReportMapper reportMapper;

    private final UserService userService;

    @Override
    public ReportResponse createReport(UUID targetId, ReportRequest request) {
        UUID reporterId = userService.getMyInfo().getId();
        var target = request.getTargetType().equals(ReportTargetType.COMMENT)
                ? commentRepository.findById(targetId).orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND))
                : courseRepository.findById(targetId).orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        if(target == null)
            throw new AppException(ErrorCode.REPORT_TARGET_INVALID);

        Report report = Report.builder()
                .reporter(userRepository.findById(reporterId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)))
                .targetId(targetId)
                .description(request.getDescription())
                .reason(request.getReason())
                .reviewedBy(null)
                .reviewedAt(null)
                .moderatorNotes(null)
                .status(ReportStatus.PENDING)
                .build();

        reportRepository.save(report);

        return reportMapper.toResponse(report);
    }

    @Override
    public PageResponse<ReportResponse> searchReport(ReportSearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Report> baseSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if(request.getFrom() != null){
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFrom()));
            }

            if(request.getTo() != null){
                predicates.add(cb.lessThan(root.get("createdAt"), request.getTo()));
            }

            if(request.getTargetType() != null){
                predicates.add(cb.equal(root.get("targetType"), request.getTargetType()));
            }

            if(request.getStatus() != null){
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Specification<Report> keywordSpec = null;
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            String keyword = request.getKeyword().trim();
            if(keyword.contains("@")){
                List<UUID> userIds = userRepository.findAllByEmailContainingIgnoreCase(keyword)
                        .stream().map(User::getId)
                        .toList();
                if(userIds.isEmpty()){
                    return PageResponse.<ReportResponse>builder()
                            .items(Collections.emptyList())
                            .page(0)
                            .size(size)
                            .totalElements(0)
                            .totalPages(0)
                            .build();

                }

                keywordSpec = (root, query, cb) ->
                        root.get("reporter").get("id").in(userIds);
            } else {
                keywordSpec = (root, query, cb) -> {
                    String pattern = "%" + keyword.toLowerCase() + "%";
                    return cb.like(cb.lower(root.join("reporter").get("firstName")), pattern);
                };
            }
        }

        Specification<Report> finalSpec = (keywordSpec == null) ? baseSpec : baseSpec.and(keywordSpec);

        Page<Report> pageResult = reportRepository.findAll(finalSpec, pageable);


        return PageResponse.<ReportResponse>builder()
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .items(pageResult.getContent()
                        .stream().map(reportMapper::toResponse).toList()
                )
                .size(pageResult.getSize())
                .page(page)
                .build();
    }

    @Override
    public ReportResponse handleReport(UUID reportId, ReportHandleRequest request) {
        UUID userId = userService.getMyInfo().getId();
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if(user.getRole() != UserRole.ADMIN)
            throw new AppException(ErrorCode.UNAUTHORIZED);

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));
        report.setStatus(request.getStatus());
        report.setModeratorNotes(request.getModeratorNotes());
        reportRepository.save(report);

        return reportMapper.toResponse(report);
    }
}
