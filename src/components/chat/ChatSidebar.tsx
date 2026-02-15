"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEllipsisV,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

const ChatSidebar = ({ selectedChat, onSelectChat }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const chats: Chat[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "Hey! How's the project going?",
      lastMessageTime: "2m",
      unreadCount: 3,
      isOnline: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar: "MC",
      lastMessage: "Can you review my code?",
      lastMessageTime: "15m",
      unreadCount: 0,
      isOnline: true,
      lastSeen: "5 minutes ago",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "Thanks for your help! 🙏",
      lastMessageTime: "1h",
      unreadCount: 1,
      isOnline: false,
      lastSeen: "2 hours ago",
    },
    {
      id: "4",
      name: "David Kumar",
      avatar: "DK",
      lastMessage: "See you tomorrow at the meeting",
      lastMessageTime: "3h",
      unreadCount: 0,
      isOnline: false,
      lastSeen: "1 day ago",
    },
    {
      id: "5",
      name: "Lisa Wang",
      avatar: "LW",
      lastMessage: "Perfect! Let's do it 👍",
      lastMessageTime: "1d",
      unreadCount: 0,
      isOnline: false,
      lastSeen: "3 days ago",
    },
  ];

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-border transition-colors border-l-4 ${
              selectedChat === chat.id
                ? "bg-blue-50 dark:bg-primary/10 border-primary"
                : "border-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {chat.avatar}
              </div>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-surface rounded-full"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-text truncate">
                  {chat.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-muted flex-shrink-0 ml-2">
                  {chat.lastMessageTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-muted truncate">
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {chat.unreadCount}
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