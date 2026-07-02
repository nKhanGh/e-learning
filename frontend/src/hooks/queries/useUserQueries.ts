import { useDebounce } from "@/hooks/useDebounce";
import { queryKeys } from "@/lib/queryKeys";
import { userService } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useSearchUsersQuery(keyword: string) {
  const debouncedKeyword = useDebounce(keyword.trim(), 500);

  return useQuery({
    queryKey: queryKeys.users.search(debouncedKeyword),
    queryFn: async () => {
      const response = await userService.searchUsers(debouncedKeyword);
      return response.data.result;
    },
    enabled: debouncedKeyword.length > 0,
    staleTime: 60_000,
  });
}
