# Backend Module: Learning Content

## Muc dich

Quan ly lecture, lecture visibility, video/document content, progress, bookmark va note cua nguoi hoc.

## File chinh

- `controller/LectureController.java`
- `service/course/LectureService.java`
- `service/course/LectureProgressService.java`
- `service/impl/course/LectureServiceImpl.java`
- `service/impl/course/LectureProgressServiceImpl.java`
- `entity/course/Lecture.java`
- `entity/course/LectureProgress.java`
- `entity/id/LectureProgressId.java`
- `entity/id/BookmarkId.java`
- `entity/id/NoteId.java`
- `repository/LectureRepository.java`
- `repository/LectureProgressRepository.java`
- `mapper/LectureMapper.java`
- `mapper/LectureProgressMapper.java`
- `dto/request/course/LectureRequest.java`
- `dto/request/course/LectureUpdateRequest.java`
- `dto/request/course/NoteRequest.java`
- `dto/response/course/LectureResponse.java`
- `dto/response/course/PublicLectureResponse.java`
- `dto/response/LectureProgressResponse.java`

## API

- `GET /api/lectures/section/{sectionId}`
- `GET /api/lectures/section/{sectionId}/general`
- `GET /api/lectures/public/section/{sectionId}`
- `GET /api/lectures/{lectureId}`
- `GET /api/lectures/public/{lectureId}`
- `POST /api/lectures`
- `PUT /api/lectures/{lectureId}`
- `DELETE /api/lectures/{lectureId}`
- `POST /api/lectures/{lectureId}/progress`
- `POST /api/lectures/{lectureId}/progress/completion`
- `GET /api/lectures/{lectureId}/progress`
- `GET /api/lectures/{lectureId}/users/{userId}/progress`
- `GET /api/lectures/courses/{courseId}/progress`
- `GET /api/lectures/courses/{courseId}/users/{userId}/progresses`
- `PUT /api/lectures/{lectureId}/progress/bookmark`
- `GET /api/lectures/bookmarks`
- `PUT /api/lectures/{lectureId}/progress/note`

## Luong hoc tap

1. User vao course detail, frontend lay section/lecture public neu chua co access.
2. Khi user hoc lecture, backend tao/cap nhat `LectureProgress`.
3. Completion, bookmark va note duoc update qua endpoint progress.
4. File/video protected duoc truy cap qua signed URL tu File module.

## Test lien quan

- `controller/LectureControllerTest.java`
- `service/LectureServiceTest.java`
- `service/LectureProgressServiceTest.java`
