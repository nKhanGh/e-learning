import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const courseService = {
  searchCourses: ({request, page, size} : {request: CourseSearchRequest, page: number, size: number}) => {
    return axiosInstance.get<ApiResponse<PageResponse<CourseResponse>>>(`/courses/search?page=${page}&size=${size}`, { params: request });
  },
}