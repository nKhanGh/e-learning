# Backend Module: Course Catalog

## Muc dich

Quan ly course, category, section, tag, search/filter va reindex course search.

## File chinh

- `controller/CourseController.java`
- `controller/CourseCategoryController.java`
- `controller/CourseSectionController.java`
- `controller/CourseTagController.java`
- `service/course/CourseService.java`
- `service/course/CourseSearchService.java`
- `service/course/CourseSearchCacheService.java`
- `service/course/CourseIndex.java`
- `service/course/CourseCategoryService.java`
- `service/course/CourseSectionService.java`
- `service/course/CourseTagService.java`
- `service/impl/course/*`
- `entity/course/Course.java`, `CourseCategory.java`, `CourseSection.java`, `CourseTag.java`
- `document/CourseDocument.java`
- `repository/CourseRepository.java`, `CourseSearchRepository.java`, `CourseCategoryRepository.java`, `CourseSectionRepository.java`, `CourseTagRepository.java`
- `mapper/CourseMapper.java`, `CourseDocumentMapper.java`, `CourseCategoryMapper.java`, `CourseSectionMapper.java`, `CourseTagMapper.java`

## API

Course:

- `POST /api/courses`
- `POST /api/courses/search`
- `POST /api/courses/admin/reindex`
- `PUT /api/courses/{courseId}`
- `GET /api/courses/{courseId}`
- `DELETE /api/courses/{courseId}`
- `GET /api/courses/my-course`
- `GET /api/courses/instructor/{instructorId}`

Category/section/tag:

- `GET|POST /api/course-categories`
- `POST /api/course-categories/list`
- `GET /api/course-sections/course/{courseId}`
- `POST /api/course-sections`
- `GET|PUT|DELETE /api/course-sections/{courseSectionId}`
- `POST /api/course-tags`
- `POST /api/course-tags/list`

## Search

Course search ket hop:

- `CourseSearchRequest`
- Elasticsearch document `CourseDocument`
- Cache service de tang toc truy van lap lai
- Reindex endpoint cho admin/dev

## Test lien quan

- `controller/CourseControllerTest.java`
- `controller/CourseCategoryControllerTest.java`
- `controller/CourseSectionControllerTest.java`
- `controller/CourseTagControllerTest.java`
- `service/CourseServiceTest.java`
- `service/CourseCategoryServiceTest.java`
- `service/CourseSectionServiceTest.java`
- `service/CourseTagServiceTest.java`
