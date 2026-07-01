import apiClient, { publicApiClient } from "@/lib/apiClient";

export const authService = {
  login: (payload: AuthenticationRequest) =>
    publicApiClient.post<ApiResponse<AuthenticationResponse>>("/auth/login", payload),
  signup: (payload: RegisterRequest) =>
    publicApiClient.post<ApiResponse<UserResponse>>("/auth/register", payload),
  verifyEmail: (payload: EmailVerifyRequest) =>
    publicApiClient.post<ApiResponse<EmailVerifyResponse>>("/auth/verify-email", payload),
  resendVerificationEmail: (payload: ResendVerificationRequest) =>
    publicApiClient.post<ApiResponse<void>>("/auth/resend-verification", payload),
  logout: (payload: LogoutRequest) =>
    apiClient.post<ApiResponse<LogoutResponse>>("/auth/logout", payload),
  refreshToken: (refreshToken: string) =>
    publicApiClient.post<ApiResponse<AuthenticationResponse>>("/auth/refresh-token", {
      refreshToken,
    }),
};
