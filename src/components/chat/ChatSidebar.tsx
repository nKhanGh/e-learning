"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEllipsisV,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useConversation } from "@/contexts/ConversationContext";
import { timeAgo } from "@/utils/time";
import Typing from "../ui/Typing";
import { useAuth } from "@/contexts/AuthContext";

interface ChatSidebarProps {
  selectedChat: ConversationResponse | null;
  onSelectChat: (chat: ConversationResponse) => void;
}

const ChatSidebar = ({ selectedChat, onSelectChat }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, userStatuses } = useConversation();

  const {user} = useAuth();

  const isUserOnline = (userId: string) => {
    return userStatuses.get(userId)?.online;
  };

  const isOnline = (chat: ConversationResponse) => {
    const participantIds = chat.participants.map((p) => p.id);
    return participantIds.some(
      (id) => isUserOnline(id.userId) && id.userId !== user?.id,
    );
  };


  return (
    <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl border-r border-gray-200 dark:border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-text">
            Messages
          </h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors">
              <FontAwesomeIcon
                icon={faPlus}
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

        {/* Search */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-border border border-transparent focus:border-primary rounded-lg text-sm focus:outline-none text-gray-900 dark:text-text placeholder-gray-500 dark:placeholder-muted"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {Array.from(conversations?.values() || []).map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectChat(conversation)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-border transition-colors border-l-4 ${
              selectedChat === conversation
                ? "bg-blue-50 dark:bg-primary/10 border-primary"
                : "border-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Image
                src={
                  conversation.ai
                    ? "/ai-avatar.svg"
                    : conversation.avatarUrl || "/default-avatar.jpg"
                }
                alt={"avatar"}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              {isOnline(conversation) && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-surface rounded-full"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-text truncate">
                  {conversation.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-muted flex-shrink-0 ml-2">
                  {conversation.lastMessageAt
                    ? timeAgo(conversation.lastMessageAt)
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                {conversation.typingAvatarUrl ? (
                  <Typing avatarUrl={conversation.typingAvatarUrl} size="sm" />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-muted truncate">
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>
                )}
                {conversation.myParticipant?.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {conversation.myParticipant?.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
