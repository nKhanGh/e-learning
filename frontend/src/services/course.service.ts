import useAxios from "@/utils/useAxios";
import axios from "axios";

const axiosInstance = useAxios();

export const courseService = {
  searchCourses: ({request, page, size} : {request: CourseSearchRequest, page: number, size: number}) => {
    return axiosInstance.get<ApiResponse<PageResponse<CourseResponse>>>(`/courses/search?page=${page}&size=${size}`, { params: request });
  },
  getCourse: (courseId: string) => axiosInstance.get<ApiResponse<CourseResponse>>(`/courses/${courseId}`),
}