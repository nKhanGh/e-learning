import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const userService = {
  getMyInfo: async () => axiosInstance.get<ApiResponse<UserResponse>>("/users/my-info"),
}