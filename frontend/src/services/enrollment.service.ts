import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const enrollmentService = {
  getMyEnrollment: (courseId: string) => {
    return axiosInstance.get<EnrollmentResponse>(`/course/${courseId}/enrollments/me`);
  }

}