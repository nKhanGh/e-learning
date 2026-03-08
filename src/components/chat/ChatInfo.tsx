// components/chat/ChatInfo.tsx
"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBell,
  faFlag,
  faImage,
  faFile,
  faChevronDown,
  faChevronUp,
  faRightFromBracket,
  faUser,
  faEllipsisVertical,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useConversation } from "@/contexts/ConversationContext";
import { useAuth } from "@/contexts/AuthContext";
import ChatAddUsers from "./ChatAddUsers";
import { conversationParticipantService } from "@/services/conversationParticipant.service";
import ChatLeaveModal from "./ChatLeaveModal";

interface ChatInfoProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChat: ConversationResponse | null;
}

const ChatInfo = ({ isOpen, onClose, selectedChat }: ChatInfoProps) => {
  const [showMedia, setShowMedia] = useState(true);
  const [showFiles, setShowFiles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [openAddUsers, setOpenAddUsers] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [openLeaving, setOpenLeaving] = useState(false);

  const { userStatuses } = useConversation();
  const { user } = useAuth();

  const isUserOnline = (userId: string) => {
    return userStatuses.get(userId)?.online;
  };


  useEffect(() => {
    if (!selectedChat) return;
    const participantIds = selectedChat.participants.map((p) => p.id);
    const online = participantIds.some(
      (id) => isUserOnline(id.userId) && id.userId !== user?.id,
    );
    setIsOnline(online);
  }, [selectedChat, userStatuses]);

  if (!selectedChat) return null;

  const mediaFiles = [
    { id: "1", type: "image", url: "📷", date: "Today" },
    { id: "2", type: "image", url: "🖼️", date: "Today" },
    { id: "3", type: "image", url: "🎨", date: "Yesterday" },
    { id: "4", type: "image", url: "📸", date: "Yesterday" },
    { id: "5", type: "image", url: "🌅", date: "2 days ago" },
    { id: "6", type: "image", url: "🎭", date: "2 days ago" },
  ];

  const files = [
    {
      id: "1",
      name: "Project_Requirements.pdf",
      size: "2.4 MB",
      date: "Today",
    },
    { id: "2", name: "Design_Mockups.fig", size: "15.8 MB", date: "Yesterday" },
    {
      id: "3",
      name: "API_Documentation.docx",
      size: "890 KB",
      date: "3 days ago",
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="w-80 bg-white dark:bg-surface border-l border-gray-200 dark:border-border flex flex-col overflow-hidden ml-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-border flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-text">
                Conversation Info
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="w-5 h-5 text-gray-600 dark:text-muted"
                />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* User Info */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-border">
                <img
                  src={selectedChat.avatarUrl || "/default-avatar.jpg"}
                  alt=""
                  className="w-20 h-20 mx-auto mb-3 rounded-full"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-text mb-1">
                  {selectedChat.name ||
                    selectedChat.participants
                      .map((p) => p?.user?.firstName)
                      .join(", ")}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-surface rounded-full"></div>
                  )}
                  {isOnline ? (
                    <div className="flex gap-1 items-center">
                      <p className="w-2 h-2 bg-green-400 rounded-full"></p>
                      <p className="text-sm text-green-400 ">Online </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-muted">
                      Offline
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-200 dark:border-border">
                <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-border transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBell}
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-text">
                    Mute
                  </span>
                </button>

                <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-border transition-colors">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faFlag}
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-text">
                    Report
                  </span>
                </button>

                <button

                onClick={() => setOpenLeaving(true)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-border transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                    />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-text">
                    Leave
                  </span>
                </button>
              </div>

              {/* User Section */}
              <div className="border-b border-gray-200 dark:border-border">
                <button
                  onClick={() => setShowUsers(!showUsers)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-600 dark:text-muted"
                    />
                    <span className="font-medium text-gray-900 dark:text-text">
                      Users
                    </span>
                    <span className="text-sm text-gray-500 dark:text-muted">
                      {selectedChat.participants.length}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={showUsers ? faChevronUp : faChevronDown}
                    className="w-4 h-4 text-gray-400"
                  />
                </button>

                <AnimatePresence>
                  {showUsers && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 p-4">
                        {selectedChat.participants.map((user) => (
                          <div
                            key={user.id.userId}
                            className="rounded-lg bg-gray-100 dark:bg-border hover:opacity-80 transition-opacity flex gap-2 p-2 w-full items-center"
                          >
                            <img
                              src={
                                user?.user?.profile?.avatarUrl ||
                                "/default-avatar.jpg"
                              }
                              alt={
                                user?.user?.firstName + " " + user?.user?.lastName
                              }
                              className="w-12 h-12 object-cover rounded-full"
                            />
                            <div className="text-sm font-medium text-gray-900 dark:text-text max-w-[70%] truncate">
                              <div>
                                {user?.user?.firstName} {user?.user?.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-muted truncate">
                                {user?.user?.email}
                              </div>
                            </div>
                            <button className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 p-1 transition-colors">
                              <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                className="w-4 h-4 text-gray-600 dark:text-muted"
                              />
                            </button>
                          </div>
                        ))}
                        <button 
                        onClick={() => setOpenAddUsers(true)}
                        className="w-full flex items-center justify-center gap-4 p-4 rounded-2xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                          <div>
                            <FontAwesomeIcon
                              icon={faUserPlus}
                              className="w-5 h-5 text-gray-600 dark:text-muted"
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-text">
                            Add User
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Media Section */}
              <div className="border-b border-gray-200 dark:border-border">
                <button
                  onClick={() => setShowMedia(!showMedia)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="w-5 h-5 text-gray-600 dark:text-muted"
                    />
                    <span className="font-medium text-gray-900 dark:text-text">
                      Media & Links
                    </span>
                    <span className="text-sm text-gray-500 dark:text-muted">
                      {mediaFiles.length}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={showMedia ? faChevronUp : faChevronDown}
                    className="w-4 h-4 text-gray-400"
                  />
                </button>

                <AnimatePresence>
                  {showMedia && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-1 p-4">
                        {mediaFiles.map((media) => (
                          <button
                            key={media.id}
                            className="aspect-square rounded-lg bg-gray-100 dark:bg-border hover:opacity-80 transition-opacity flex items-center justify-center text-4xl"
                          >
                            {media.url}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Files Section */}
              <div className="border-b border-gray-200 dark:border-border">
                <button
                  onClick={() => setShowFiles(!showFiles)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={faFile}
                      className="w-5 h-5 text-gray-600 dark:text-muted"
                    />
                    <span className="font-medium text-gray-900 dark:text-text">
                      Files
                    </span>
                    <span className="text-sm text-gray-500 dark:text-muted">
                      {files.length}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={showFiles ? faChevronUp : faChevronDown}
                    className="w-4 h-4 text-gray-400"
                  />
                </button>

                <AnimatePresence>
                  {showFiles && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {files.map((file) => (
                          <button
                            key={file.id}
                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-border hover:bg-gray-100 dark:hover:bg-muted transition-colors flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon
                                icon={faFile}
                                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-gray-900 dark:text-text truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-muted">
                                {file.size} • {file.date}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted mb-1">
                    Member since
                  </p>
                  <p className="text-sm text-gray-900 dark:text-text">
                    January 15, 2024
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted mb-1">
                    Time zone
                  </p>
                  <p className="text-sm text-gray-900 dark:text-text">
                    PST (GMT-8)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-muted mb-1">
                    Local time
                  </p>
                  <p className="text-sm text-gray-900 dark:text-text">2:30 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {openAddUsers && <ChatAddUsers conversationId={selectedChat.id} open={openAddUsers} onClose={() => setOpenAddUsers(false)} />}
        {openLeaving && <ChatLeaveModal conversationId={selectedChat.id} open={openLeaving} onClose={() => setOpenLeaving(false)} />}
    </>
  );
};

export default ChatInfo;
