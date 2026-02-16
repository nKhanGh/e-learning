"use client";
import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMain from "@/components/chat/ChatMain";
import ChatInfo from "@/components/chat/ChatInfo";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="flex h-[calc(100vh-112px)] bg-gray-50 dark:bg-bg overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat selected */}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-80`}
      >
        <ChatSidebar
          selectedChat={selectedChat}
          onSelectChat={(chatId) => {
            setSelectedChat(chatId);
            setShowInfo(false);
          }}
        />
      </div>

      {/* Main Chat - Hidden on mobile when no chat selected */}
      <div
        className={`${
          selectedChat ? "flex" : "hidden md:flex"
        } flex-1`}
      >
        <ChatMain
          selectedChat={selectedChat}
          showInfo={showInfo}
          onToggleInfo={() => setShowInfo(!showInfo)}
          onBack={() => setSelectedChat(null)} // Add back button for mobile
        />
      </div>

      {/* Info Panel */}
      <ChatInfo
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        selectedChat={selectedChat}
      />
    </div>
  );
}