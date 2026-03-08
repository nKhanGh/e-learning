import axios, { AxiosRequestConfig } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const useAxios = () => {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_API_URL || "/api",
  });


  const axiosNoAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_API_URL || "/api",
  });

  axiosInstance.interceptors.request.use((config) => {
    if (!config.skipAuth) {
      const token = localStorage.getItem("learnioAccessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log("Response:", response);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("learnioRefreshToken");
          const res = await axiosNoAuth.post("/auth/refresh", {
            refreshToken,
          });
          const newAccessToken = res.data.result.accessToken;
          const newRefreshToken = res.data.result.refreshToken;
          localStorage.setItem("learnioRefreshToken", newRefreshToken);
          localStorage.setItem("learnioAccessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          globalThis.dispatchEvent(new Event("logout"));
          localStorage.removeItem("learnioAccessToken");
          localStorage.removeItem("learnioRefreshToken");
          if (refreshError instanceof Error) {
            throw refreshError;
          }

          throw new Error("An unknown error occurred during token refresh.");
        }
      }
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred during the request.");
    },
  );

  return axiosInstance;
};

export default useAxios;
