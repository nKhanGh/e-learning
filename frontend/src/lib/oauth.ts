import { API_BASE_URL } from "@/lib/apiClient";

export type OAuthProvider = "google" | "github";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getOAuthAuthorizationUrl = (provider: OAuthProvider) => {
  const baseUrl =
    API_BASE_URL.startsWith("http") || typeof window === "undefined"
      ? API_BASE_URL
      : `${window.location.origin}${API_BASE_URL}`;

  return `${trimTrailingSlash(baseUrl)}/oauth2/authorization/${provider}`;
};

export const startOAuthLogin = (provider: OAuthProvider) => {
  if (typeof window === "undefined") return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  localStorage.setItem(
    "learnioOAuthRedirectPath",
    currentPath.startsWith("/auth") ? "/en" : currentPath,
  );
  window.location.href = getOAuthAuthorizationUrl(provider);
};
