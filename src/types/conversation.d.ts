interface ConversationParticipantId {
  conversationId: string;
  userId: string;
}

interface ConversationParticipantResponse {
  id: ConversationParticipantId;
  user: UserResponse;
  lastReadAt: Instant;
  unreadCount: number;
  nickname: string;
}

interface ConversationResponse {
  id: string;
  isGroup: boolean;
  participants: ConversationParticipantResponse[];
  lastMessageAt: Instant;
  name: string;
  description: string;
  avatarUrl: string;
  myParticipant: ConversationParticipantResponse;
  lastMessage: string;
}

interface ConversationCreationRequest {
  isGroup: boolean;
  participantIds: string[];
  name: string;
  description: string;
}
