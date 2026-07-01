import apiClient from "@/lib/apiClient";

export const conversationService = {
  getMyConversations: async () =>
    apiClient.get<ApiResponse<ConversationResponse[]>>("/conversations"),
  searchConversations: async ({
    keyword,
    isGroup,
  }: {
    keyword: string;
    isGroup: boolean;
  }) =>
    apiClient.get<ApiResponse<ConversationResponse[]>>(
      "/conversations/search",
      {
        params: { keyword, isGroup },
      },
    ),
  createConversation: async ({
    avatarFile,
    data,
  }: {
    avatarFile?: File;
    data: ConversationCreationRequest;
  }) => {
    const formData = new FormData();
    if (avatarFile) {
      formData.append("avatarFile", avatarFile);
    }
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );

    return apiClient.post<ApiResponse<ConversationResponse>>(
      "/conversations",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
  createAIConversation: async () =>
    apiClient.post<ApiResponse<ConversationResponse>>("/conversations/ai"),
  changeAvatar: async (conversationId: string, avatarFile: File) => {
    const formData = new FormData();
    formData.append("avatarFile", avatarFile);

    return apiClient.put<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
  changeName: async (conversationId: string, name: string) =>
    apiClient.put<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}/name`,
      { name },
    ),
  deleteConversation: async (conversationId: string) =>
    apiClient.delete<ApiResponse<void>>(`/conversations/${conversationId}`),
};
