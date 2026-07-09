import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};
