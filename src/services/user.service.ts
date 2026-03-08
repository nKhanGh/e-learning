import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const userService = {
  getMyInfo: async () => axiosInstance.get<ApiResponse<UserResponse>>("/users/my-info"),
  searchUsers: async (keyword: string) =>
    axiosInstance.get<ApiResponse<UserResponse[]>>("/users/search", {
      params: { keyword },
    }),
}