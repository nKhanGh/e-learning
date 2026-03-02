import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const messageService = {
  getMessagesByConversationId: async (conversationId: string) =>
    axiosInstance.get<ApiResponse<PageResponse<MessageResponse>>>(
      `/messages/conversations/${conversationId}`,
    ),
}