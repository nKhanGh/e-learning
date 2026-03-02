import axios from "axios";
import { authService } from "@/services/auth.service";
import webSocketService from "./WebSocketService";

export const login = async (request: AuthenticationRequest) => {
  try {
    const response = await authService.login(request);
    localStorage.setItem(
      "learnioAccessToken",
      response.data.result.accessToken,
    );
    localStorage.setItem(
      "learnioRefreshToken",
      response.data.result.refreshToken,
    );

    console.log("Login successful:", response.data);

    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw new Error("An unknown error occurred during login.");
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
}
