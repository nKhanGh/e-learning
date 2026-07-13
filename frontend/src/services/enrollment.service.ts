import apiClient from "@/lib/apiClient";

export const enrollmentService = {
  enroll: (courseId: string) =>
    apiClient.post<ApiResponse<EnrollmentResponse>>(
      `/courses/${courseId}/enrollments`,
    ),
  getMyEnrollment: (courseId: string) =>
    apiClient.get<ApiResponse<EnrollmentResponse>>(
      `/courses/${courseId}/enrollments/me`,
    ),
  getMyLearning: () =>
    apiClient.get<ApiResponse<EnrollmentResponse[]>>("/learning/my-courses"),
};
