# Backend Module: Report va Moderation

## Muc dich

Cho phep user tao report cho doi tuong trong he thong va cho admin/moderator tim kiem, xu ly report.

## File chinh

- `controller/ReportController.java`
- `service/interaction/ReportService.java`
- `service/impl/interaction/ReportServiceImpl.java`
- `entity/common/Report.java`
- `repository/ReportRepository.java`
- `mapper/ReportMapper.java`
- `dto/request/common/ReportRequest.java`
- `dto/request/common/ReportSearchRequest.java`
- `dto/request/common/ReportHandleRequest.java`
- `dto/response/common/ReportResponse.java`
- `enums/ReportReason.java`
- `enums/ReportStatus.java`
- `enums/ReportTargetType.java`

## API

- `POST /api/reports/{targetId}`
- `GET /api/reports/search`
- `PUT /api/reports/{reportId}`

## Luong xu ly

1. User gui report kem `targetId`, target type/reason/detail.
2. Backend luu `Report` voi status ban dau.
3. Admin/moderator search report theo filter.
4. Handler cap nhat status/ket qua xu ly.

## Test lien quan

- `controller/ReportControllerTest.java`
- `service/ReportServiceTest.java`
