"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import webSocketService from "@/utils/WebSocketService";
import { useMyConversationsQuery } from "@/hooks/queries/useConversationQueries";

type UserStatus = {
  userId: string;
  online: boolean;
  lastSeen: Timestamp;
};

type ConversationContextType = {
  conversations: Map<string, ConversationResponse> | null;
  setConversations: React.Dispatch<
    React.SetStateAction<Map<string, ConversationResponse> | null>
  >;
  userStatuses: Map<string, UserStatus>;
  unreadCount: number;
  wsConnected: boolean;
};

const ConversationContext = createContext<ConversationContextType | null>(null);

export const ConversationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [conversations, setConversations] = useState<Map<
    string,
    ConversationResponse
  > | null>(null);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(
    new Map(),
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();

  const currentUserId = user?.id;
  const conversationsQuery = useMyConversationsQuery(Boolean(currentUserId));
  const queriedConversations = useMemo(() => {
    if (!conversationsQuery.data) return null;

    return new Map(
      conversationsQuery.data.map((conversation: ConversationResponse) => [
        conversation.id,
        conversation,
      ]),
    );
  }, [conversationsQuery.data]);
  const activeConversations = conversations ?? queriedConversations;
  const setConversationState = useCallback(
    (value: React.SetStateAction<Map<string, ConversationResponse> | null>) => {
      setConversations((prev) => {
        if (typeof value === "function") {
          return value(prev ?? activeConversations);
        }

        return value;
      });
    },
    [activeConversations],
  );

  const updateConversationWithMessage = (
    prev: Map<string, ConversationResponse> | null,
    msg: MessageResponse,
  ): Map<string, ConversationResponse> | null => {
    const source = prev ?? activeConversations;
    if (!source) return prev;
    const updatedMap = new Map(source);
    const existingConversation = updatedMap.get(msg.conversationId);
    if (existingConversation) {
      if (existingConversation.lastMessage.id === msg.id) {
        return prev; // No update needed
      }
      updatedMap.set(msg.conversationId, {
        ...existingConversation,
        lastMessage: msg,
        lastMessageAt: msg.createdAt,
        messages: [...(existingConversation.messages || []), msg],
        myParticipant: {
          ...existingConversation.myParticipant,
          unreadCount:
            existingConversation.myParticipant.unreadCount +
            (msg.sender.id === currentUserId ? 0 : 1),
        },
      });
    }
    return updatedMap;
  };

  const updateConversationWithTyping = (
    prev: Map<string, ConversationResponse> | null,
    conversationId: string,
    typingAvatarFileName: string | null,
  ): Map<string, ConversationResponse> | null => {
    const source = prev ?? activeConversations;
    if (!source) return prev;
    const updatedMap = new Map(source);
    const existingConversation = updatedMap.get(conversationId);
    if (existingConversation) {
      updatedMap.set(conversationId, {
        ...existingConversation,
        typingAvatarFileName,
      });
    }
    return updatedMap;
  };

  const handleConnected = () => {
    console.log("💬 Chat: WebSocket connected");
    setWsConnected(true);
  };

  const handleMessage = (msg: MessageResponse) => {
    console.log("💬 New message received via WebSocket:", msg);
    setConversations((prev) => updateConversationWithMessage(prev, msg));
  };

  const handleTypingStart = (
    conversationId: string,
    typingAvatarFileName: string | null,
  ) => {
    setConversations((prev) =>
      updateConversationWithTyping(prev, conversationId, typingAvatarFileName),
    );
  };

  const handleTypingEnd = (conversationId: string) => {
    setConversations((prev) =>
      updateConversationWithTyping(prev, conversationId, null),
    );
  };

  const handleTyping = (data: TypingNotification) => {
    console.log("💬 Typing event received:", data);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    const typingAvatarFileName =
      data.userId === currentUserId ? null : data.avatarFileName;
    if (data.typing) {
      handleTypingStart(data.conversationId, typingAvatarFileName);
    } else {
      handleTypingEnd(data.conversationId);
      return;
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingEnd(data.conversationId);
    }, 3000);
  };

  const handleUserStatusChange = (event: {
    userId: string;
    online: boolean;
    timestamp: Timestamp;
  }) => {
    console.log("💬 User status change event:", event);
    setUserStatuses((prev) => {
      const updatedMap = new Map(prev);
      updatedMap.set(event.userId, {
        userId: event.userId,
        online: event.online,
        lastSeen: event.timestamp,
      });
      return updatedMap;
    });
  };

  const handleUnread = (count: number) => setUnreadCount(count);

  const handleRead = (data: ReadNotification) => {
    setConversations((prev) => {
      const source = prev ?? activeConversations;
      if (!source) return prev;
      const updatedMap = new Map(source);
      const conversation = updatedMap.get(data.conversationId);
      if (conversation) {
        if (conversation.myParticipant.id.userId !== data.userId) {
          conversation.myParticipant.unreadCount = 0;
          conversation.myParticipant.lastReadAt = new Date().toISOString();
        }
        conversation.participants.forEach((p) => {
          if (p.id.userId === data.userId) {
            p.unreadCount = 0;
            p.lastReadAt = new Date().toISOString();
          }
        });
        updatedMap.set(data.conversationId, conversation);
      }
      return updatedMap;
    });
  };

  useEffect(() => {
    webSocketService.on("connected", handleConnected);
    webSocketService.on("message", handleMessage);
    webSocketService.on("typing", handleTyping);
    webSocketService.on("unread", handleUnread);
    webSocketService.on("readReceipt", handleRead);
    webSocketService.on("userStatus", handleUserStatusChange);

    return () => {
      console.log("💬 Cleaning up chat listeners");
      webSocketService.off("connected", handleConnected);
      webSocketService.off("message", handleMessage);
      webSocketService.off("typing", handleTyping);
      webSocketService.off("unread", handleUnread);
      webSocketService.off("readReceipt", handleRead);
      webSocketService.off("userStatus", handleUserStatusChange);
    };
  }, [currentUserId]);

  const value = useMemo(
    () => ({
      conversations: activeConversations,
      userStatuses,
      unreadCount,
      wsConnected,
      setConversations: setConversationState,
    }),
    [
      activeConversations,
      setConversationState,
      unreadCount,
      userStatuses,
      wsConnected,
    ],
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversation must be used within a ConversationProvider",
    );
  }
  return context;
};
