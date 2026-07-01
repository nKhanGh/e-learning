# Frontend Module: Course Experience

## Muc dich

Hien thi home featured courses, danh sach/search course, filter, course detail, purchase card va section accordion.

## File chinh

- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/courses/page.tsx`
- `frontend/src/app/[locale]/courses/[id]/page.tsx`
- `frontend/src/components/courses/CourseCard.tsx`
- `frontend/src/components/courses/CourseSidebar.tsx`
- `frontend/src/components/courseDetail/PurchaseCard.tsx`
- `frontend/src/components/courseDetail/SectionAcordion.tsx`
- `frontend/src/services/course.service.ts`
- `frontend/src/services/courseCategory.service.ts`
- `frontend/src/services/enrollment.service.ts`
- `frontend/src/types/course.d.ts`
- `frontend/src/types/enrollment.d.ts`
- `frontend/src/types/enums/CourseLevel.enum.ts`
- `frontend/src/types/enums/EnrollmentStatus.enum.ts`

## Chuc nang

- Home lay 6 course dau tien de hien thi popular courses.
- Courses page co filter theo keyword/category/level/price/rating/sort.
- Course detail lay course theo id va render thong tin course, instructor, review mock, section mock.
- Course category service lay danh muc tu backend.
- Enrollment service doc enrollment hien tai cua user.

## API service hien tai

- `GET /courses/search?page={page}&size={size}` voi params filter.
- `GET /courses/{courseId}`
- `GET /course-categories`
- `GET /course/{courseId}/enrollments/me`

## Luu y tich hop

- Backend search endpoint hien tai la `POST /courses/search`; frontend dang dung `GET /courses/search`.
- Backend enrollment endpoint la `/courses/{courseId}/enrollments/me`; frontend dang dung `/course/{courseId}/enrollments/me`.
- Course detail page dang fetch hardcoded `http://localhost:8080/api/courses/{id}` thay vi env.
