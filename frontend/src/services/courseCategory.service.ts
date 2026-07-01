import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const courseCategoryService = {
  getAllCategories: () => axiosInstance.get<ApiResponse<CourseCategoryResponse[]>>("/course-categories"),
}

