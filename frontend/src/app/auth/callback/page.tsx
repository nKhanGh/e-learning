"use client";

import Loading from "@/components/ui/Loading";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_REDIRECT_PATH = "/en";

const OAuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign in...");

  const callbackState = useMemo(
    () => ({
      status: searchParams.get("status"),
      accessToken: searchParams.get("accessToken"),
      refreshToken: searchParams.get("refreshToken"),
      errorMessage: searchParams.get("message") || searchParams.get("error"),
    }),
    [searchParams],
  );

  useEffect(() => {
    const { status, accessToken, refreshToken, errorMessage } = callbackState;
    console.log("OAuth callback state:", callbackState);
    if (status === "error" || errorMessage) {
      const nextMessage = errorMessage || "OAuth sign in failed.";
      setMessage(nextMessage);
      toast.error(nextMessage);
      router.replace(DEFAULT_REDIRECT_PATH);
      console.log("OAuth callback error:", nextMessage);
      return;
    }

    if (!accessToken || !refreshToken) {
      const nextMessage = "OAuth callback is missing tokens.";
      setMessage(nextMessage);
      toast.error(nextMessage);
      router.replace(DEFAULT_REDIRECT_PATH);
      console.log("OAuth callback error:", nextMessage);
      return;
    }

    console.log("OAuth callback success:", { accessToken, refreshToken });

    localStorage.setItem("learnioAccessToken", accessToken);
    localStorage.setItem("learnioRefreshToken", refreshToken);

    const redirectPath =
      localStorage.getItem("learnioOAuthRedirectPath") || DEFAULT_REDIRECT_PATH;
    localStorage.removeItem("learnioOAuthRedirectPath");

    toast.success("Signed in successfully.");
    router.replace(redirectPath);
  }, [callbackState, router]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-bg px-4">
      <div className="flex flex-col items-center gap-3 text-center text-gray-700 dark:text-gray-200">
        <Loading size="lg" color="blue" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </main>
  );
};

export default OAuthCallbackPage;
