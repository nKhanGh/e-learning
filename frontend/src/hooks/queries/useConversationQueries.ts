import { queryKeys } from "@/lib/queryKeys";
import { conversationService } from "@/services/conversation.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMyConversationsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.conversations.my,
    queryFn: async () => {
      const response = await conversationService.getMyConversations();
      return response.data.result;
    },
    enabled,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationService.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.my });
    },
  });
}

export function useCreateAIConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationService.createAIConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.my });
    },
  });
}
