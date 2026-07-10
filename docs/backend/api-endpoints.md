# Backend API Endpoints

Tat ca endpoint ben duoi nam sau prefix `/api`.

## Authentication

| Method | Path | Mo ta |
| --- | --- | --- |
| POST | `/auth/login` | Dang nhap |
| POST | `/auth/register` | Dang ky |
| POST | `/auth/logout` | Dang xuat |
| POST | `/auth/refreshtToken` | Refresh token theo controller hien tai |
| POST | `/auth/verify-email` | Xac thuc email |
| POST | `/auth/forgot-password` | Gui email quen mat khau |
| POST | `/auth/reset-password` | Dat lai mat khau |

## Users

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/users/my-info` | Lay thong tin user hien tai |
| PUT | `/users/{userId}` | Cap nhat user, ho tro avatar multipart |
| PUT | `/users/my-profile` | Cap nhat profile hien tai |
| DELETE | `/users/{userId}` | Xoa user |
| GET | `/users/{userId}` | Lay user theo id |
| GET | `/users/course/{courseId}` | Lay user trong course |
| POST | `/users/instructor` | Tao instructor profile |
| GET | `/users/search` | Tim user |

## Courses

| Method | Path | Mo ta |
| --- | --- | --- |
| POST | `/courses` | Tao course |
| POST | `/courses/search` | Search course co filter/page/size |
| POST | `/courses/admin/reindex` | Reindex course search |
| PUT | `/courses/{courseId}` | Cap nhat course |
| GET | `/courses/{courseId}` | Lay course |
| GET | `/courses/{courseId}/curriculum` | Lay curriculum public/student |
| GET | `/courses/{courseId}/enrollment-status` | Lay trang thai access/enrollment cua user hien tai |
| GET | `/courses/{courseId}/publish-checklist` | Lay checklist publish cho instructor/admin |
| POST | `/courses/{courseId}/submit-review` | Submit course sang `PENDING_REVIEW` neu checklist pass |
| DELETE | `/courses/{courseId}` | Xoa course |
| GET | `/courses/my-course` | Lay course cua instructor hien tai |
| GET | `/courses/instructor/{instructorId}` | Lay course theo instructor |

## Course categories, sections, tags

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/course-categories` | Lay danh sach category |
| POST | `/course-categories` | Tao category |
| POST | `/course-categories/list` | Tao nhieu category |
| GET | `/course-sections/course/{courseId}` | Lay section theo course |
| POST | `/course-sections` | Tao section |
| GET | `/course-sections/{courseSectionId}` | Lay section |
| PUT | `/course-sections/{courseSectionId}` | Cap nhat section |
| DELETE | `/course-sections/{courseSectionId}` | Xoa section |
| POST | `/course-tags` | Tao tag |
| POST | `/course-tags/list` | Tao nhieu tag |

## Lectures va progress

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/lectures/section/{sectionId}` | Lay lectures theo section |
| GET | `/lectures/section/{sectionId}/general` | Lay lecture general/public preview |
| GET | `/lectures/public/section/{sectionId}` | Lay public lectures theo section |
| GET | `/lectures/{lectureId}` | Lay lecture |
| GET | `/lectures/public/{lectureId}` | Lay public lecture |
| POST | `/lectures` | Tao lecture |
| PUT | `/lectures/{lectureId}` | Cap nhat lecture |
| DELETE | `/lectures/{lectureId}` | Xoa lecture |
| POST | `/lectures/{lectureId}/progress` | Tao/cap nhat progress |
| POST | `/lectures/{lectureId}/progress/completion` | Mark completed |
| GET | `/lectures/{lectureId}/progress` | Lay progress cua user hien tai |
| GET | `/lectures/{lectureId}/users/{userId}/progress` | Lay progress user |
| GET | `/lectures/courses/{courseId}/progress` | Lay progress course cua user hien tai |
| GET | `/lectures/courses/{courseId}/users/{userId}/progresses` | Lay progress course theo user |
| PUT | `/lectures/{lectureId}/progress/bookmark` | Toggle bookmark |
| GET | `/lectures/bookmarks` | Lay bookmarked lectures |
| PUT | `/lectures/{lectureId}/progress/note` | Luu note |

## Quiz va attempts

| Method | Path | Mo ta |
| --- | --- | --- |
| POST | `/quizzes` | Tao quiz |
| PUT | `/quizzes/{quizId}` | Cap nhat quiz |
| GET | `/quizzes/lecture/{lectureId}` | Lay quiz theo lecture |
| GET | `/quizzes/public/lecture/{lectureId}` | Lay public quiz theo lecture |
| GET | `/quizzes/{quizId}` | Lay quiz |
| GET | `/quizzes/public/{quizId}` | Lay public quiz |
| DELETE | `/quizzes/{quizId}` | Xoa quiz |
| POST | `/quizzes/{quizId}/attempts` | Tao/submit attempt |
| PUT | `/quizzes/{quizId}/submission` | Submit dap an |
| GET | `/quizzes/{quizId}/users/{userId}/attempts/{attemptNumber}` | Lay attempt cua user |
| GET | `/quizzes/quizzes/{quizId}/attempts/{attemptNumber}` | Lay attempt detail theo controller hien tai |
| GET | `/quizzes/{quizId}/attempts` | Lay attempts cua quiz |

## Quiz questions

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/quiz-questions/{quizId}` | Lay questions theo quiz |
| POST | `/quiz-questions` | Tao question |
| POST | `/quiz-questions/import` | Import questions tu JSON, ho tro APPEND/REPLACE |
| DELETE | `/quiz-questions/{quizQuestionId}` | Xoa question |
| PUT | `/quiz-questions/{quizQuestionId}` | Cap nhat question |

## Enrollment

| Method | Path | Mo ta |
| --- | --- | --- |
| POST | `/courses/{courseId}/enrollments` | Ghi danh course |
| GET | `/courses/{courseId}/enrollments` | Lay enrollment theo course |
| GET | `/users/{userId}/enrollments` | Lay enrollment theo user |
| GET | `/courses/{courseId}/users/{userId}/enrollments` | Lay enrollment cu the |
| GET | `/courses/{courseId}/enrollments/me` | Lay enrollment cua user hien tai |
| PUT | `/courses/{courseId}/access` | Cap nhat access |
| PUT | `/courses/{courseId}/completion` | Mark course completed |

## Conversations va messages

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/conversations` | Lay conversation cua user |
| GET | `/conversations/search` | Search conversation |
| POST | `/conversations` | Tao conversation |
| POST | `/conversations/ai` | Tao AI conversation |
| PUT | `/conversations/{conversationId}/avatar` | Doi avatar conversation |
| PUT | `/conversations/{conversationId}/name` | Doi ten conversation |
| DELETE | `/conversations/{conversationId}` | Xoa conversation |
| POST | `/conversations/{conversationId}/participants/me` | Join conversation |
| DELETE | `/conversations/{conversationId}/participants/me` | Leave conversation |
| POST | `/conversations/{conversationId}/participants` | Them participant |
| DELETE | `/conversations/{conversationId}/participants/{participantId}` | Xoa participant |
| POST | `/messages` | Gui message bang REST fallback |
| POST | `/messages/send-file` | Gui file message |
| GET | `/messages/conversations/{conversationId}` | Lay messages trong conversation |
| POST | `/messages/{messageId}/reaction` | React message |
| GET | `/messages/{messageId}/reaction` | Lay reactions |

## AI

| Method | Path | Mo ta |
| --- | --- | --- |
| POST | `/ai/chat` | Chat voi AI |
| DELETE | `/ai/chat/memory/{conversationId}` | Xoa memory conversation AI |
| POST | `/ai/recommendations/by-preferences` | Goi y theo preference |
| GET | `/ai/recommendations/similar/{courseId}` | Goi y course tuong tu |
| GET | `/ai/recommendations/beginners` | Goi y course beginner |

## Files va reports

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/files/avatars/{fileName}` | Doc avatar file |
| GET | `/files/protected/{fileName}` | Doc protected file bang signed URL |
| GET | `/files/signed-url` | Tao signed URL |
| POST | `/reports/{targetId}` | Tao report |
| GET | `/reports/search` | Search report |
| PUT | `/reports/{reportId}` | Xu ly report |

## WebSocket/STOMP

- Endpoint: `/api/ws`
- Client publish:
  - `/app/chat.send`
  - `/app/chat.typing`
  - `/app/chat.read`
  - `/app/user.online.request`
- Client subscribe:
  - `/user/queue/message`
  - `/user/queue/typing`
  - `/user/queue/unread-count`
  - `/user/queue/read-receipt`
  - `/user/queue/user-status-init`
  - `/topic/user.online`
