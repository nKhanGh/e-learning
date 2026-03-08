import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const messageService = {
  getMessagesByConversationId: async (conversationId: string, page = 0, size = 20, signal?: AbortSignal) =>
    axiosInstance.get<ApiResponse<PageResponse<MessageResponse>>>(
      `/messages/conversations/${conversationId}?page=${page}&size=${size}`,
      { signal }
    ),
}