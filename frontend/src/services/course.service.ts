import apiClient, { publicApiClient } from "@/lib/apiClient";

export const courseService = {
  searchCourses: (request: CourseSearchRequest) =>
    publicApiClient.post<CourseSearchApiResponse>(
      "/courses/search",
      request,
    ),
  getCourse: (courseId: string) =>
    publicApiClient.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`),
  getMyCourses: (
    page = 0,
    size = 9,
    keyword = "",
    status?: CourseStatus,
  ) =>
    apiClient.get<ApiResponse<PageResponse<CourseResponse>>>(
      "/courses/my-course",
      { params: { page, size, keyword: keyword || undefined, status } },
    ),
  createCourse: (request: CourseCreationRequest) =>
    apiClient.post<ApiResponse<CourseResponse>>("/courses", request),
  updateCourse: (courseId: string, request: CourseUpdateRequest) =>
    apiClient.put<ApiResponse<CourseResponse>>(`/courses/${courseId}`, request),
  getCurriculum: (courseId: string) =>
    apiClient.get<ApiResponse<CourseCurriculumResponse>>(
      `/courses/${courseId}/curriculum`,
    ),
  getCourseSections: (courseId: string) =>
    apiClient.get<ApiResponse<CourseSectionResponse[]>>(
      `/course-sections/course/${courseId}`,
    ),
  createCourseSection: (request: CourseSectionRequest) =>
    apiClient.post<ApiResponse<CourseSectionResponse>>(
      "/course-sections",
      request,
    ),
  updateCourseSection: (sectionId: string, request: CourseSectionRequest) =>
    apiClient.put<ApiResponse<CourseSectionResponse>>(
      `/course-sections/${sectionId}`,
      request,
    ),
  deleteCourseSection: (sectionId: string) =>
    apiClient.delete<ApiResponse<void>>(`/course-sections/${sectionId}`),
  getEnrollmentStatus: (courseId: string) =>
    apiClient.get<ApiResponse<CourseEnrollmentStatusResponse>>(
      `/courses/${courseId}/enrollment-status`,
    ),
};
