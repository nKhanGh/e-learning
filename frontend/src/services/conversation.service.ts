import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const conversationService = {
  getMyConversations: async () =>
    axiosInstance.get<ApiResponse<ConversationResponse[]>>("/conversations"),
  searchConversations: async ({
    keyword,
    isGroup,
  }: {
    keyword: string;
    isGroup: boolean;
  }) =>
    axiosInstance.get<ApiResponse<ConversationResponse[]>>(
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
    console.log("Creating conversation with data:", data);
    if (avatarFile) {
      formData.append("avatarFile", avatarFile);
    }
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" }),
    );
    return axiosInstance.post<ApiResponse<ConversationResponse>>(
      "/conversations",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
  createAIConversation: async () => {
    return axiosInstance.post<ApiResponse<ConversationResponse>>(
      "/conversations/ai",
    );
  },
  changeAvatar: async (conversationId: string, avatarFile: File) => {
    const formData = new FormData();
    formData.append("avatarFile", avatarFile);
    return axiosInstance.post<ApiResponse<ConversationResponse>>(
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
    axiosInstance.put<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}/name`,
      { name },
    ),
  changeDescription: async (conversationId: string, description: string) =>
    axiosInstance.put<ApiResponse<ConversationResponse>>(
      `/conversations/${conversationId}/description`,
      { description },
    ),
  deleteConversation: async (conversationId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/conversations/${conversationId}`),
};
