import useAxios from "@/utils/useAxios";

const axiosInstance = useAxios();

export const conversationParticipantService = {
  add: (conversationId: string, participantId: string) => {
    return axiosInstance.post(`/conversations/${conversationId}/participants`, null, {params: { participantId }});
  }
};