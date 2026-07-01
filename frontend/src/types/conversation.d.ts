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
  ai: boolean;
  lastMessage: Message;
  messages: MessageResponse[];
  typingAvatarFileName: string | null;
  hasMore: boolean;
}

interface TypingRequest {
  conversationId: string;
  typing: boolean;
}

interface TypingNotification {
  conversationId: string;
  userId: string;
  avatarFileName: string;
  typing: boolean;
}

interface ReadNotification{
  conversationId: string;
  userId: string;
}

interface ConversationEvent {
  type: ConversationEventType;
  data: TypingNotification | MessageResponse | ReadNotification;
}

interface ConversationCreationRequest {
  participantIds: string[];
  name: string | null;
  description: string | null;
}
