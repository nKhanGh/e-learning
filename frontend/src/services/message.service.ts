import apiClient from "@/lib/apiClient";

export const messageService = {
  getMessagesByConversationId: async (
    conversationId: string,
    page = 0,
    size = 20,
    signal?: AbortSignal,
  ) =>
    apiClient.get<ApiResponse<PageResponse<MessageResponse>>>(
      `/messages/conversations/${conversationId}?page=${page}&size=${size}`,
      { signal },
    ),
};
