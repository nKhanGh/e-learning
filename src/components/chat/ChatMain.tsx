"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faPaperPlane,
  faImage,
  faFaceSmile,
  faEllipsisV,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect, use } from "react";
import webSocketService from "@/utils/WebSocketService";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { messageService } from "@/services/message.service";
import { timeAgo } from "@/utils/time";

interface Message {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  status?: "sent" | "delivered" | "read";
}

interface ChatMainProps {
  selectedChat: ConversationResponse | null;
  showInfo: boolean;
  onToggleInfo: () => void;
  onBack?: () => void;
}

const ChatMain = ({
  selectedChat,
  showInfo,
  onToggleInfo,
  onBack,
}: ChatMainProps) => {
  const [message, setMessage] = useState("");
  const [parentMessage, setParentMessage] = useState<MessageResponse | null>(
    null,
  );
  const [isOnline, setIsOnline] = useState(false);

  const { user } = useAuth();
  const { conversations, setConversations, userStatuses } = useConversation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMyMessage = (msg: MessageResponse) => msg.sender?.id === user?.id;

  useEffect(() => {
    console.log("Selected chat changed:", selectedChat);

    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const response = await messageService.getMessagesByConversationId(
          selectedChat.id,
        );
        setConversations((prev) => {
          if (!prev) return prev;
          const updated = new Map(prev);
          const conversation = updated.get(selectedChat.id);
          if (conversation) {
            conversation.messages = response.data.result.items;
            updated.set(selectedChat.id, conversation);
          }
          return updated;
        });
        console.log("Fetched messages:", response.data.result);
      } catch (error) {
        console.error("Error fetching messages:", (error as any).response);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat?.id || !user) return;
    if (selectedChat.ai){
      
    }
    webSocketService.sendMessage(
      selectedChat.id,
      message,
      parentMessage?.id || null,
    );
    const newMessage: MessageResponse = {
      id: `temp-${Date.now()}`,
      content: message,
      conversationId: selectedChat.id,
      createdAt: new Date().toISOString(),
      parent: parentMessage || null,
      sender: user,
      courseRecommendations: [],
    };
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isUserOnline = (userId: string) => {
    return userStatuses.get(userId)?.online;
  };

  useEffect(() => {
    if (!selectedChat) return;
    const participantIds = selectedChat.participants.map((p) => p.id);
    const online = participantIds.some((id) => isUserOnline(id.userId) && id.userId !== user?.id);
    console.log("User online status for chat", userStatuses);
    setIsOnline(online);
  }, [selectedChat, userStatuses]);

  const isFirstMessageInGroup = (index: number) => {
    if (!selectedChat) return true;
    if (index === 0) return true;
    const messages = conversations?.get(selectedChat.id)?.messages;
    if (!messages) return true;
    const prevTime = new Date(messages[index - 1].createdAt).getTime();
    const currentTime = new Date(messages[index].createdAt).getTime();

    const diffInMinutes = (currentTime - prevTime) / (1000 * 60);

    return diffInMinutes >= 10;
  };

  const isUserLastMessageInGroup = (index: number) => {
    if (!selectedChat) return true;
    const messages = conversations?.get(selectedChat.id)?.messages;
    if (!messages || index === messages.length - 1) return true;
    return messages[index + 1]?.sender?.id !== messages[index]?.sender?.id;
  };

  const getOtherParticipantId = () => {
    if (!selectedChat) return null;
    if (!isDirect) return null;
    const otherParticipant = selectedChat.participants.find(
      (p) => p.id.userId !== user?.id,
    );
    return otherParticipant?.id.userId || null;
  };

  const isDirect =
    selectedChat?.participants.length && selectedChat.participants.length === 2;

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 ml-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-border rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="text-3xl text-gray-400 dark:text-muted"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-text mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-600 dark:text-muted">
            Choose a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 ml-4 rounded-t-2xl">
      {/* Header */}
      <div className="h-16 px-6 border-b border-gray-200 dark:border-border flex items-center justify-between bg-white dark:bg-gray-900 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={
                selectedChat.ai
                  ? "/ai-avatar.svg"
                  : selectedChat.avatarUrl || "/default-avatar.jpg"
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface rounded-full"></div>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-text">
              {selectedChat.name || "Unknown User"}
            </h2>
            {isOnline && isDirect && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Online
              </p>
            )}
            {!isOnline && isDirect && (
              <p className="text-sm text-gray-500 dark:text-muted">
                Online {" "}
                {(() => {
                  const participantId = getOtherParticipantId();
                  return participantId &&
                    userStatuses.get(participantId)?.lastSeen
                    ? timeAgo(userStatuses.get(participantId)?.lastSeen || "")
                    : "Never";
                })()}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleInfo}
            className={`w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors ${
              showInfo ? "bg-gray-100 dark:bg-border" : ""
            }`}
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="w-5 h-5 text-gray-600 dark:text-muted"
            />
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors">
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="w-5 h-5 text-gray-600 dark:text-muted"
            />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
        {(conversations?.get(selectedChat?.id)?.messages ?? []).map(
          (msg, index) => (
            <div key={msg.id} className={`w-full`}>
              {isFirstMessageInGroup(index) && (
                <div className="text-xs w-full flex justify-center text-gray-500 dark:text-muted mb-2">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "long",
                    year: "2-digit",
                  })}
                </div>
              )}
              <div
                className={`w-full flex ${isMyMessage(msg) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md flex ${isMyMessage(msg) ? "order-2" : "order-1"}`}
                >
                  {isMyMessage(msg) ? null : (
                    <img
                      src={
                        selectedChat.ai
                          ? "/ai-avatar.svg"
                          : msg.sender?.profile?.avatarUrl ||
                            "/default-avatar.jpg"
                      }
                      alt="Sender Avatar"
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMyMessage(msg)
                          ? "bg-gradient-to-tr from-primary to-secondary text-white rounded-br-none"
                          : "bg-white dark:bg-surface text-gray-900 dark:text-text rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-muted ${
                        isMyMessage(msg) ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{timeAgo(msg?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-border bg-white dark:bg-surface">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors flex-shrink-0">
            <FontAwesomeIcon
              icon={faImage}
              className="w-5 h-5 text-gray-600 dark:text-muted"
            />
          </button>

          <div className="flex-1 relative h-full">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full h-full px-4 py-3 pr-12 bg-gray-100 dark:bg-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-text placeholder-gray-500 dark:placeholder-muted"
            />
            <button className="absolute right-2 bottom-[50%] transform translate-y-1/2 w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
              <FontAwesomeIcon
                icon={faFaceSmile}
                className="text-2xl text-primary hover:text-primary/80"
              />
            </button>
          </div>
          {message.trim().length === 0 ? (
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <FontAwesomeIcon
                icon={faThumbsUp}
                className="text-2xl text-primary hover:text-primary/80"
              />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-10 h-10 rounded-full  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="text-2xl text-primary hover:text-primary/80"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
