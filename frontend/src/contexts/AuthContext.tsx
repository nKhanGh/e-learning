"use client";

import { useCurrentUserQuery } from "@/hooks/queries/useAuthQueries";
import { queryKeys } from "@/lib/queryKeys";
import { userService } from "@/services/user.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

const getStoredAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("learnioAccessToken");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getStoredAccessToken,
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => Boolean(getStoredAccessToken()),
  );
  const [manualUser, setManualUser] = useState<UserResponse | null>(null);
  const currentUserQuery = useCurrentUserQuery(Boolean(accessToken));

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setIsLoggedIn(Boolean(token));

    if (typeof window === "undefined") return;

    if (token) {
      localStorage.setItem("learnioAccessToken", token);
    } else {
      localStorage.removeItem("learnioAccessToken");
    }
  }, []);

  const setUser = useCallback((nextUser: UserResponse | null) => {
    setManualUser(nextUser);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    const storedAccessToken = localStorage.getItem("learnioAccessToken");
    if (!storedAccessToken) {
      setAccessToken(null);
      setManualUser(null);
      return;
    }

    setAccessToken(storedAccessToken);

    try {
      const currentUser = await queryClient.fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: async () => {
          const response = await userService.getMyInfo();
          return response.data.result;
        },
      });
      setManualUser(currentUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setAccessToken(null);
      setManualUser(null);
    }
  }, [queryClient, setAccessToken]);

  useEffect(() => {
    const handleLogout = () => {
      setAccessToken(null);
      setManualUser(null);
      localStorage.removeItem("learnioRefreshToken");
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    };

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, [queryClient, setAccessToken]);

  const user = manualUser ?? currentUserQuery.data ?? null;
  const effectiveIsLoggedIn =
    isLoggedIn && Boolean(accessToken) && !currentUserQuery.isError;

  const value = useMemo(
    () => ({
      isLoggedIn: effectiveIsLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      fetchUserInfo,
      accessToken,
      setAccessToken,
    }),
    [
      accessToken,
      effectiveIsLoggedIn,
      fetchUserInfo,
      setAccessToken,
      setUser,
      user,
    ],
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
