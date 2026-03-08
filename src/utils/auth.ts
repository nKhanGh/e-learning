import axios from "axios";
import { authService } from "@/services/auth.service";
import webSocketService from "./WebSocketService";
import { toast } from "sonner";

export const login = async (request: AuthenticationRequest) => {
  try {
    console.log("Attempting login with request:", request);
    const response = await authService.login(request);
    console.log("Login response:", response);

    const result = response?.data?.result;
    if (!result?.accessToken || !result?.refreshToken) {
      const backendMessage =
        response?.data?.message || "Login failed";
      throw new Error(backendMessage);
    }

    localStorage.setItem("learnioAccessToken", result.accessToken);
    localStorage.setItem("learnioRefreshToken", result.refreshToken);

    console.log("Login successful:", response.data);
    return result;
  } catch (error: unknown) {
    console.log("Login error:", error);

    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; error?: string }
        | undefined;
      throw new Error(data?.message || data?.error || "Login failed");
    }

    throw new Error(error instanceof Error ? error.message : "Login failed");
  }
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("learnioRefreshToken");
  const accessToken = localStorage.getItem("learnioAccessToken");
  if (refreshToken && accessToken) {
    try {
      await authService.logout({ accessToken, refreshToken });
      webSocketService.disconnect();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  localStorage.removeItem("learnioAccessToken");
  localStorage.removeItem("learnioRefreshToken");

  globalThis.dispatchEvent(new Event("logout"));
};