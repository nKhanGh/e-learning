package com.khangdev.elearningbe.mapper;

import com.khangdev.elearningbe.dto.response.common.ReportResponse;
import com.khangdev.elearningbe.entity.common.Report;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    ReportResponse toResponse(Report report);
}
