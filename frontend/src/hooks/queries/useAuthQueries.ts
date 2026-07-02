import { queryKeys } from "@/lib/queryKeys";
import { userService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await userService.getMyInfo();
      return response.data.result;
    },
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });
}
