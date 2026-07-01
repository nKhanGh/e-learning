import { queryKeys } from "@/lib/queryKeys";
import { messageService } from "@/services/message.service";
import { useQueryClient } from "@tanstack/react-query";

export function useMessageQueryClient() {
  const queryClient = useQueryClient();

  const fetchConversationMessages = (
    conversationId: string,
    page = 0,
    size = 20,
  ) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.messages.byConversation(conversationId, page, size),
      queryFn: async ({ signal }) => {
        const response = await messageService.getMessagesByConversationId(
          conversationId,
          page,
          size,
          signal,
        );
        return response.data.result;
      },
      staleTime: 30_000,
    });

  return { fetchConversationMessages };
}
