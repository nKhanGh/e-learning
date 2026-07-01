# Backend Module: Enrollment

## Muc dich

Quan ly ghi danh course, truy van enrollment theo course/user, cap nhat access va completion.

## File chinh

- `controller/EnrollmentController.java`
- `service/course/EnrollmentService.java`
- `service/impl/course/EnrollmentServiceImpl.java`
- `entity/enrollment/Enrollment.java`
- `entity/id/EnrollmentId.java`
- `repository/EnrollmentRepository.java`
- `mapper/EnrollmentMapper.java`
- `dto/response/EnrollmentResponse.java`
- `enums/EnrollmentStatus.java`

## API

- `POST /api/courses/{courseId}/enrollments`
- `GET /api/courses/{courseId}/enrollments`
- `GET /api/users/{userId}/enrollments`
- `GET /api/courses/{courseId}/users/{userId}/enrollments`
- `GET /api/courses/{courseId}/enrollments/me`
- `PUT /api/courses/{courseId}/access`
- `PUT /api/courses/{courseId}/completion`

## Luong chinh

1. User enroll course.
2. Backend tao `Enrollment` voi composite id `EnrollmentId`.
3. Access endpoint ghi nhan user da bat dau/duoc phep hoc.
4. Completion endpoint danh dau course completed.

## Phu thuoc

- Course module de validate course.
- User/auth module de lay user hien tai.
- Lecture progress co the dung enrollment de tinh quyen xem protected content.

## Test lien quan

- `controller/EnrollmentControllerTest.java`
- `service/EnrollmentServiceTest.java`
