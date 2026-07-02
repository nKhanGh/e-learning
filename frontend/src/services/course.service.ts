import apiClient, { publicApiClient } from "@/lib/apiClient";

export const courseService = {
  searchCourses: (request: CourseSearchRequest) =>
    publicApiClient.post<CourseSearchApiResponse>(
      "/courses/search",
      request,
    ),
  getCourse: (courseId: string) =>
    publicApiClient.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`),
  getMyCourses: (page = 0, size = 9) =>
    apiClient.get<ApiResponse<PageResponse<CourseResponse>>>(
      "/courses/my-course",
      { params: { page, size } },
    ),
  getCurriculum: (courseId: string) =>
    apiClient.get<ApiResponse<CourseCurriculumResponse>>(
      `/courses/${courseId}/curriculum`,
    ),
  getEnrollmentStatus: (courseId: string) =>
    apiClient.get<ApiResponse<CourseEnrollmentStatusResponse>>(
      `/courses/${courseId}/enrollment-status`,
    ),
};
