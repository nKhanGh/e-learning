import apiClient from "@/lib/apiClient";

export const authService = {
  login: (payload: AuthenticationRequest) =>
    apiClient.post<ApiResponse<AuthenticationResponse>>("/auth/login", payload),
  signup: (payload: RegisterRequest) =>
    apiClient.post<ApiResponse<UserResponse>>("/auth/register", payload),
  logout: (payload: LogoutRequest) =>
    apiClient.post<ApiResponse<LogoutResponse>>("/auth/logout", payload),
  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthenticationResponse>>("/auth/refreshtToken", {
      refreshToken,
    }),
};
