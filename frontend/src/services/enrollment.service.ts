import apiClient from "@/lib/apiClient";

export const enrollmentService = {
  getMyEnrollment: (courseId: string) =>
    apiClient.get<ApiResponse<EnrollmentResponse>>(
      `/courses/${courseId}/enrollments/me`,
    ),
};
