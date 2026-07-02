import apiClient from "@/lib/apiClient";

export const userService = {
  getMyInfo: async () =>
    apiClient.get<ApiResponse<UserResponse>>("/users/my-info"),
  searchUsers: async (keyword: string) =>
    apiClient.get<ApiResponse<UserResponse[]>>("/users/search", {
      params: { keyword },
    }),
};
