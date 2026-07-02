import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { redirectToErrorPage } from "./errorRedirect";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_API_URL || "/api";

export const getServerApiBaseUrl = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_API_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_APP_API_URL is required for server API calls");
  }

  return apiBaseUrl;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (globalThis.window === undefined) return config;

  const token = localStorage.getItem("learnioAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (globalThis.window === undefined) {
      throw error;
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401) {
      redirectToErrorPage(error.response?.status);
      throw error;
    }

    if (!originalRequest || originalRequest._retry) {
      redirectToErrorPage(401);
      throw error;
    }

    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("learnioRefreshToken");
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      const response = await publicApiClient.post<ApiResponse<AuthenticationResponse>>(
        "/auth/refresh-token",
        { refreshToken },
      );

      const { accessToken, refreshToken: nextRefreshToken } = response.data.result;
      localStorage.setItem("learnioAccessToken", accessToken);
      localStorage.setItem("learnioRefreshToken", nextRefreshToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("learnioAccessToken");
      localStorage.removeItem("learnioRefreshToken");
      globalThis.dispatchEvent(new Event("logout"));
      redirectToErrorPage(401);
      return Promise.reject(refreshError);
    }
  },
);

export { publicApiClient };
export default apiClient;
