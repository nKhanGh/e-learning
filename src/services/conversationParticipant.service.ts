import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const conversationParticipantService = {
  add: (conversationId: string, participantId: string) => {
    return axiosInstance.post(`/conversations/${conversationId}/participants`, null, {params: { participantId }});
  }, 
  leave: (conversationId: string) => {
    return axiosInstance.delete(`/conversations/${conversationId}/participants/me`);
  }
};