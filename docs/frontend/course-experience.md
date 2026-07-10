# Frontend Module: Course Experience

## Muc dich

Hien thi home featured courses, danh sach/search course, filter, course detail, purchase card, section accordion va instructor course authoring entry points.

## File chinh

- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/courses/page.tsx`
- `frontend/src/app/[locale]/courses/[id]/page.tsx`
- `frontend/src/app/[locale]/instructor/courses/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/page.tsx`
- `frontend/src/components/courses/CourseCard.tsx`
- `frontend/src/components/courses/CourseSidebar.tsx`
- `frontend/src/components/courseDetail/PurchaseCard.tsx`
- `frontend/src/components/courseDetail/SectionAcordion.tsx`
- `frontend/src/services/course.service.ts`
- `frontend/src/services/courseCategory.service.ts`
- `frontend/src/services/enrollment.service.ts`
- `frontend/src/hooks/queries/useCourseQueries.ts`
- `frontend/src/hooks/queries/useEnrollmentQueries.ts`
- `frontend/src/types/course.d.ts`
- `frontend/src/types/enrollment.d.ts`
- `frontend/src/types/enums/CourseLevel.enum.ts`
- `frontend/src/types/enums/EnrollmentStatus.enum.ts`

## Chuc nang

- Home lay 6 course dau tien de hien thi popular courses.
- Courses page co filter theo keyword/category/level/price/rating/sort.
- Course detail lay course theo id, curriculum/enrollment status va render section/lecture theo access state.
- Instructor My Courses co search, filter status, status counts va thumbnail fallback.
- Instructor Course Studio quan ly sections, lectures, quiz overview, resources va publish checklist.
- Lecture Preview/Detail Studio la noi edit sau article/quiz/questions/resources.
- Course category service lay danh muc tu backend.
- Enrollment status duoc doc tu course service cho course detail.

## API service hien tai

- `POST /courses/search` voi body filter/page/size.
- `GET /courses/{courseId}`
- `GET /courses/{courseId}/curriculum`
- `GET /courses/{courseId}/enrollment-status`
- `GET /courses/my-course`
- `GET /courses/{courseId}/publish-checklist`
- `POST /courses/{courseId}/submit-review`
- `GET /course-sections/course/{courseId}`
- `GET /lectures/section/{sectionId}`
- `POST|PUT|DELETE /lectures`
- `GET|POST|PUT|DELETE /quizzes`
- `GET|POST|PUT|DELETE /quiz-questions`
- `POST /quiz-questions/import`
- `GET /course-categories`

## Luu y tich hop

Home va course detail dung `NEXT_PUBLIC_APP_API_URL` thong qua shared API base URL.

Chi tiet instructor flow nam trong [Instructor Course Studio](instructor-course-studio.md).
