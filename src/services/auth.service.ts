import { UserResponse } from "@/types/user";
import useAxios from "@/utils/useAxios";



const axiosInstance = useAxios();

export const authService = {
  login: (payload: AuthenticationRequest) => axiosInstance.post<ApiResponse<AuthenticationResponse>>("/auth/login", payload),
  signup: (payload: RegisterRequest) => axiosInstance.post<ApiResponse<UserResponse>>("/auth/signup", payload),
  logout: (payload: LogoutRequest) => axiosInstance.post<ApiResponse<LogoutResponse>>("/auth/logout", payload),
  refreshToken: (refreshToken: string) =>
    axiosInstance.post<ApiResponse<AuthenticationResponse>>("/auth/refresh", { refreshToken }),
}