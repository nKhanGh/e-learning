"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { conversationService } from "@/services/conversation.service";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import webSocketService from "@/utils/WebSocketService";

type UserStatus = {
  userId: string;
  online: boolean;
  lastSeen: Timestamp;
};

type ConversationContextType = {
  conversations: Map<string, ConversationResponse> | null;
  setConversations: (conversations: Map<string, ConversationResponse> | null) => void;
  userStatuses: Map<string, UserStatus>;
  unreadCount: number;
  wsConnected: boolean;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export const ConversationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [conversations, setConversations] = useState<Map<
    string,
    ConversationResponse
  > | null>(new Map());
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(
    new Map(),
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const { user } = useAuth();

  const currentUserId = user?.id;

  const fetchConversations = async () => {
    try {
      const response = await conversationService.getMyConversations();
      const conversationsArray = response.data.result;
      const conversationsMap = new Map(
        conversationsArray.map((conversation: ConversationResponse) => [
          conversation.id,
          conversation,
        ]),
      );
      setConversations(conversationsMap);
      console.log("Fetched conversations:", conversationsArray);
    } catch (error) {
      console.error("Error fetching conversations:", (error as any).response);
    }
  };

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations();
  }, [currentUserId]);

  useEffect(() => {
    const handleConnected = () => {
      console.log("💬 Chat: WebSocket connected");
      setWsConnected(true);
    };

    const handleMessage = (msg: MessageResponse) => {
      console.log("💬 New message received via WebSocket:", msg);
      setConversations((prev) => {
        if (!prev) return prev;

        const updatedMap = new Map(prev);
        const existingConversation = updatedMap.get(msg.conversationId);
        if (existingConversation) {
          if (existingConversation.lastMessage.id === msg.id) {
            return prev; // No update needed
          }
          updatedMap.set(msg.conversationId, {
            ...existingConversation,
            lastMessage: msg,
            lastMessageAt: msg.createdAt,
            messages: [...existingConversation.messages, msg],
            myParticipant: {
              ...existingConversation.myParticipant,
              unreadCount:
                existingConversation.myParticipant.unreadCount +
                (msg.sender.id === currentUserId ? 0 : 1),
            },
          });
        }
        return updatedMap;
      });
    };

    const handleTyping = (data: {
      conversationId: string;
      userId: string;
      typingAvatarUrl: string;
    }) => {
      console.log("💬 Typing event received:", data);
      setConversations((prev) => {
        if (!prev) return prev;
        const updatedMap = new Map(prev);
        const existingConversation = updatedMap.get(data.conversationId);
        if (existingConversation) {
          updatedMap.set(data.conversationId, {
            ...existingConversation,
            typingAvatarUrl:
              data.userId === currentUserId ? null : data.typingAvatarUrl,
          });
        }
        return updatedMap;
      });
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
    webSocketService.on("connected", handleConnected);
    webSocketService.on("message", handleMessage);
    webSocketService.on("typing", handleTyping);
    webSocketService.on("unread", handleUnread);
    webSocketService.on("userStatus", handleUserStatusChange);

    return () => {
            console.log('💬 Cleaning up chat listeners');
            webSocketService.off('connected', handleConnected);
            webSocketService.off('message', handleMessage);
            webSocketService.off('typing', handleTyping);
            webSocketService.off('unread', handleUnread);
            webSocketService.off('userStatus', handleUserStatusChange);
        };
  }, [currentUserId]);

  const value = useMemo(
    () => ({
      conversations,
      userStatuses,
      unreadCount,
      wsConnected,
      setConversations,
    }),
    [conversations, userStatuses, unreadCount, wsConnected, setConversations],
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
}
