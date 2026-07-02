import apiClient from "@/lib/apiClient";

export const conversationParticipantService = {
  add: (conversationId: string, participantId: string) =>
    apiClient.post(`/conversations/${conversationId}/participants`, null, {
      params: { participantId },
    }),
  leave: (conversationId: string) =>
    apiClient.delete(`/conversations/${conversationId}/participants/me`),
};
