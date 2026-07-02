import apiClient from "@/lib/apiClient";

export const aiService = {
  chat: (payload: MessageSendRequest) =>
    apiClient.post<ApiResponse<MessageResponse>>("/ai/chat", payload),
};
