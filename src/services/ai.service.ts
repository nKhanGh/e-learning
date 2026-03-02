import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const aiService = {
  chat: (payload: MessageSendRequest) => axiosInstance.post<ApiResponse<MessageResponse>>("/ai/chat", payload),
}