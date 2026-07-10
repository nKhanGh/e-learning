# Backend Module: Course Publishing

## Muc dich

Quan ly dieu kien san sang publish va flow instructor gui course len admin review. Module nay nam trong Course domain, nhung duoc tach rieng trong tai lieu vi no noi giua Course, Section, Lecture, Quiz va status lifecycle.

## File chinh

- `controller/CourseController.java`
- `service/course/CourseService.java`
- `service/impl/course/CourseServiceImpl.java`
- `dto/response/course/CoursePublishChecklistResponse.java`
- `entity/course/Course.java`
- `entity/course/CourseSection.java`
- `entity/course/Lecture.java`
- `entity/course/Quiz.java`
- `repository/CourseSectionRepository.java`
- `repository/LectureRepository.java`
- `exception/ErrorCode.java`

## API

Tat ca endpoint nam sau prefix `/api`.

| Method | Path | Mo ta |
| --- | --- | --- |
| GET | `/courses/{courseId}/publish-checklist` | Lay checklist publish theo course, chi owner instructor/admin duoc xem |
| POST | `/courses/{courseId}/submit-review` | Gui course sang `PENDING_REVIEW` neu checklist pass |

## Course status lien quan

| Status | Y nghia |
| --- | --- |
| `DRAFT` | Instructor dang build course |
| `PENDING_REVIEW` | Instructor da submit, dang cho admin review |
| `PUBLISHED` | Course da duoc publish |
| `REJECTED` | Course bi tu choi, can sua va submit lai |
| `UNPUBLISHED` | Course tung public nhung dang an |
| `ARCHIVED` | Course da luu tru |

## Checklist contract

`CoursePublishChecklistResponse`:

```json
{
  "courseId": "uuid",
  "ready": false,
  "groups": [
    {
      "key": "COURSE_INFO",
      "label": "Course information",
      "items": [
        {
          "key": "COURSE_THUMBNAIL",
          "status": "FAILED",
          "message": "Course thumbnail is required.",
          "targetType": "COURSE_BASIC_INFO",
          "targetId": "uuid"
        }
      ]
    }
  ]
}
```

`status` co 3 gia tri:

- `PASSED`: dieu kien da dat.
- `WARNING`: co the publish tiep, nhung nen xem lai, vi du lecture/quiz unpublished.
- `FAILED`: chan submit review.

`targetType` giup frontend dieu huong nut Fix:

- `COURSE_BASIC_INFO`: quick edit course.
- `SECTIONS`, `SECTION`: Course Studio tab Sections.
- `LECTURES`, `LECTURE`: Course Studio tab Lectures.
- `LECTURE_PREVIEW`: lecture preview/detail studio.
- `QUIZ`: quiz overview.

## Dieu kien backend dang kiem tra

Course information:

- Co title.
- Co description.
- Co category.
- Co level.
- Co language.
- Co thumbnail URL.

Curriculum:

- Co it nhat 1 section.
- Co it nhat 1 lecture.
- Moi section co it nhat 1 lecture.
- Lecture co title.
- Lecture ARTICLE co `textContent`.
- Lecture VIDEO co video file/url field.
- Lecture FILE co attachment.
- Lecture EXTERNAL_LINK co external URL.
- Lecture unpublished tao warning.

Quiz:

- Lecture co `contentType = QUIZ` phai co quiz config.
- Quiz phai co it nhat 1 question.
- Quiz unpublished tao warning.

Pricing:

- Course free thi price phai bang 0.
- Course paid thi price phai lon hon 0.

## Submit review

`submitForReview(courseId)`:

1. Lay course va verify owner/admin.
2. Chan submit neu course da `PENDING_REVIEW`.
3. Chan submit neu course da `PUBLISHED`.
4. Goi lai publish checklist o backend.
5. Neu checklist co `FAILED`, throw `COURSE_NOT_FULLY_COMPLETED`.
6. Neu pass, set course status thanh `PENDING_REVIEW` va update `lastUpdatedContent`.

## Sort order

Cac API instructor lien quan den course structure phai tra data theo `displayOrder`:

- Sections: `findByCourseIdOrderByDisplayOrderAsc`.
- Lectures by section: `findBySectionIdOrderByDisplayOrderAsc`.
- Publish checklist: sort sections theo `displayOrder`, lectures theo section display order roi lecture display order.

Frontend van sort phong ho, nhung backend la source of truth cho thu tu.

## Loi lien quan

- `COURSE_NOT_FULLY_COMPLETED`: checklist chua pass.
- `COURSE_ALREADY_SUBMITTED`: course da o `PENDING_REVIEW`.
- `COURSE_ALREADY_PUBLISHED`: course da o `PUBLISHED`.

## Viec con lai

Flow publish moi dung o buoc instructor submit. Buoc tiep theo nen la Admin Review:

- Admin list course `PENDING_REVIEW`.
- Admin preview course nhu student/teacher.
- Admin approve -> `PUBLISHED`.
- Admin reject -> `REJECTED` kem ly do.
- Instructor xem feedback va submit lai.
