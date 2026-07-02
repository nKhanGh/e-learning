import apiClient from "@/lib/apiClient";

export const courseCategoryService = {
  getAllCategories: () =>
    apiClient.get<ApiResponse<CourseCategoryResponse[]>>("/course-categories"),
};
