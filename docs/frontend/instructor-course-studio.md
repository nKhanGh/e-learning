# Frontend Module: Instructor Course Studio

## Muc dich

Quan ly trai nghiem instructor tao, sua, preview va gui duyet course. Module nay bao phu luong sau:

```text
My Courses -> Create/Quick Edit -> Course Studio -> Lecture Preview/Detail -> Publish Checklist -> Submit Review
```

Enrollment/payment va admin review chua nam trong module nay.

## Routes

| Route | Mo ta |
| --- | --- |
| `/:locale/instructor/courses` | My Courses: list course cua instructor, search, filter status, metrics |
| `/:locale/instructor/courses/new` | Tao draft course |
| `/:locale/instructor/courses/:id/edit` | Quick edit thong tin co ban |
| `/:locale/instructor/studio/:id` | Course Studio overview va tabs |
| `/:locale/instructor/studio/:id/preview/lectures/:lectureId` | Lecture Preview/Detail Studio |

## File chinh

- `frontend/src/app/[locale]/instructor/courses/page.tsx`
- `frontend/src/app/[locale]/instructor/courses/new/page.tsx`
- `frontend/src/app/[locale]/instructor/courses/[id]/edit/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/SectionsTab.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/LecturesTab.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/QuizTab.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/ResourcesTab.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/ChecklistTab.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/LectureDialog.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/components/QuizQuestionImportDialog.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/components/QuizConfigDialog.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/components/QuizPreviewContent.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/components/QuizQuestionDialog.tsx`
- `frontend/src/components/common/ConfirmDeleteDialog.tsx`
- `frontend/src/components/courseDetail/CourseLectureSidebar.tsx`
- `frontend/src/hooks/queries/useCourseQueries.ts`
- `frontend/src/services/course.service.ts`
- `frontend/src/types/course.d.ts`

## My Courses

Chuc nang:

- Lay `/courses/my-course`.
- Search bang keyword.
- Filter theo `ALL`, `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `UNPUBLISHED`, `ARCHIVED`.
- Status counts lay tu backend page response, khong chi dem item tren trang hien tai.
- Thumbnail dung URL user nhap. Neu teacher dan link Google Images `imgres`, UI boc `imgurl`; neu load fail thi fallback `/default-course-background.png`.

## Create va Quick Edit

Create course:

- Tao draft course voi basic information.
- Thumbnail hien tai la URL, chua co upload file.
- Category/level/language dung shadcn Select.

Quick edit:

- Sua title, description, category, thumbnail, price, level, language.
- Dung de fix cac loi course basic info trong publish checklist.

## Course Studio tabs

Course Studio la overview va entry point cho tung phan:

| Tab | Vai tro |
| --- | --- |
| Sections | CRUD section, publish flag, display order |
| Lectures | CRUD lecture metadata, content type, publish flag, preview link |
| Quiz | Quiz overview theo section, khong edit sau truc tiep |
| Resources | Quan ly attachment/link resources theo lecture |
| Publish checklist | Hien checklist backend va submit review |

## Lecture Preview/Detail Studio

Teacher bam Preview tu lecture de vao man hinh detail.

Man hinh nay:

- Hien sidebar curriculum dung chung `CourseLectureSidebar`.
- Sidebar teacher dung source instructor day du: `/course-sections/course/:id` + `/lectures/section/:id`, nen hien ca unpublished/empty section.
- Sidebar va previous/next sort theo `displayOrder`.
- Main content render theo `contentType`.

Theo content type:

- `ARTICLE`: render markdown content va cho edit qua `LectureDialog`.
- `VIDEO`: hien placeholder/video info, sau nay them video upload/edit.
- `QUIZ`: hien quiz config, question list, CRUD question, import JSON.
- `FILE`: hien attachments/resources.
- `EXTERNAL_LINK`: hien external URL.

## Quiz flow moi

Quiz tab trong Studio chi la overview:

- Teacher chon section.
- UI hien lecture co `contentType = QUIZ`.
- Card hien title, published status, question count, total points, passing score, time limit, missing states.
- Card chi can 1 action chinh: vao lecture preview/detail.

Edit sau cua quiz nam trong preview:

- `QuizConfigDialog`: edit config nhu passing score, time limit minutes, max attempts, total points, randomize, show answers, published.
- `QuizPreviewContent`: quan ly question CRUD.
- `QuizQuestionDialog`: add/edit question.
- `QuizQuestionImportDialog`: import JSON bang paste hoac file.

## Import quiz questions JSON

JSON import chi nhan noi dung cau hoi:

- `questionText`
- `explanation`
- `points`
- `options`
- `correctAnswers`

Khong nhan `imageUrl`/`videoUrl` trong JSON vi media upload se duoc them sau.

Mode:

- `APPEND`: them vao cuoi, ke ca quiz chua co question.
- `REPLACE`: xoa question cu roi import moi.

## Resources

Resources hien duoc luu trong lecture `attachments`.

UI:

- Chon section.
- Chon lecture.
- Them link resource.
- Edit resource inline tren dung card.
- Remove resource co confirm dialog.
- Save resources ghi lai lecture attachments va `isDownloadable`.

Day la workflow tam truoc khi co file upload that.

## Publish checklist

Frontend goi:

- `GET /courses/{courseId}/publish-checklist`.
- `POST /courses/{courseId}/submit-review`.

Checklist render theo groups/items tu backend:

- Course information.
- Curriculum.
- Quiz readiness.
- Pricing.

Moi item co:

- `PASSED`, `WARNING`, `FAILED`.
- message tu backend.
- nut Fix neu item can sua.

Nut Fix dieu huong theo `targetType`:

- `COURSE_BASIC_INFO` -> quick edit.
- `LECTURE_PREVIEW` -> lecture preview/detail.
- `SECTION`, `SECTIONS`, `LECTURE`, `LECTURES`, `QUIZ` -> Course Studio.

Submit UI:

- Neu checklist chua ready thi disabled.
- Neu course `PENDING_REVIEW`, hien `Submitted for review` va khong cho submit lai.
- Neu course `PUBLISHED`, hien `Published` va khong cho submit lai.
- Trong tab checklist, khi da submitted/published thi chi hien banner trang thai, khong hien them nut duplicate.

## Delete safety

Cac action xoa moi them dung `ConfirmDeleteDialog`:

- Section.
- Lecture.
- Quiz.
- Quiz question.
- Resource.

Dialog nay thay cho `window.confirm` de UI dong nhat va tranh xoa nham.

## Query/cache

`useCourseQueries.ts` quan ly server state:

- Course detail, my courses, sections, curriculum.
- Lectures by section va lectures by many sections.
- Quiz by lecture, quiz questions.
- Publish checklist.
- Mutations invalidate course structure, curriculum, sections, lectures, quiz, checklist va course list.

## Sort order

UI sort phong ho theo `displayOrder` tai:

- Course Studio sections.
- Lectures tab.
- Lecture preview sidebar.
- `CourseLectureSidebar`.

Backend van la source of truth cho sort order.

## Viec con lai

- Admin review workflow: approve/reject course.
- Rejected feedback cho instructor.
- Upload file/image that cho thumbnail, video thumbnail, resources.
- Student-style preview day du truoc khi submit.
