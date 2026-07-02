import apiClient from "@/lib/apiClient";

export const courseService = {
  searchCourses: ({
    request,
    page,
    size,
  }: {
    request: CourseSearchRequest;
    page: number;
    size: number;
  }) =>
    apiClient.post<ApiResponse<PageResponse<CourseResponse>>>(
      `/courses/search?page=${page}&size=${size}`,
      request,
    ),
  getCourse: (courseId: string) =>
    apiClient.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`),
};
