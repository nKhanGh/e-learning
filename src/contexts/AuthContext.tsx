"use client";
import { userService } from "@/services/user.service";
import { UserResponse } from "@/types/user";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: UserResponse | null;
  setUser: (user: UserResponse | null) => void;
  fetchUserInfo: () => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  fetchUserInfo: async () => {},
  accessToken: null,
  setAccessToken: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    console.log("Checking for access token in localStorage...");
    const accessToken = localStorage.getItem("learnioAccessToken");
    if (accessToken) {
      setIsLoggedIn(true);
      setAccessToken(accessToken);
      try {
        const response = await userService.getMyInfo();
        setUser(response.data.result);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setIsLoggedIn(false);
      }
    }
  };
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false);
      setAccessToken(null);
      setUser(null);
    };

    fetchUserInfo();

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      fetchUserInfo,
      accessToken,
      setAccessToken,
    }),
    [isLoggedIn, user, accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
