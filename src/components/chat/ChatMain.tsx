"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faPaperPlane,
  faImage,
  faFaceSmile,
  faEllipsisV,
  faPhone,
  faVideo,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";
import { conversationService } from "@/services/conversation.service";
import webSocketService from "@/utils/WebSocketService";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";

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
  const [parentMessage, setParentMessage] = useState<MessageResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  const {user} = useAuth();
  const {conversations, setConversations} = useConversation();
  

  const messagesEndRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    console.log("Selected chat changed:", selectedChat);
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat?.id || !user) return;
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
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
              src={selectedChat.ai ? "/ai-avatar.svg" : (selectedChat.avatarUrl || "/default-avatar.jpg")}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface rounded-full"></div>
          </div>

          {/* Info */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-text">
              {selectedChat.name || "Unknown User"}
            </h2>
            <p className="text-xs text-green-600 dark:text-green-400">Online</p>
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
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender.id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-md ${msg.sender.id === user?.id ? "order-2" : "order-1"}`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  msg.sender.id === user?.id
                    ? "bg-gradient-to-tr from-primary to-secondary text-white rounded-br-none"
                    : "bg-white dark:bg-surface text-gray-900 dark:text-text rounded-bl-none shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
              {/* <div
                className={`flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-muted ${
                  msg.sender.id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <span>{msg.createdAt}</span>
                {msg.sender.id === user?.id && msg.status && (
                  <span>
                    {msg.status === "sent" && "✓"}
                    {msg.status === "read" && (
                      <span className="text-blue-500">✓✓</span>
                    )}
                  </span>
                )}
              </div> */}
            </div>
          </div>
        ))}
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
