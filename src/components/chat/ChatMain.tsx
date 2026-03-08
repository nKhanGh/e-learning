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
import { useState, useRef, useEffect } from "react";
import webSocketService from "@/utils/WebSocketService";
import { useAuth } from "@/contexts/AuthContext";
import { useConversation } from "@/contexts/ConversationContext";
import { messageService } from "@/services/message.service";
import { timeAgo } from "@/utils/time";
import { aiService } from "@/services/ai.service";
import Typing from "../ui/Typing";
import Loading from "../ui/Loading";
import { useLocale } from "next-intl";
import Link from "next/link";

interface ChatMainProps {
  selectedChat: ConversationResponse | null;
  showInfo: boolean;
  onToggleInfo: () => void;
  onBack?: () => void;
}

const getLevelClassName = (level: string) => {
  switch (level) {
    case "BEGINNER":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
};

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
  const [page, setPage] = useState(0);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(false);
  const [sending, setSending] = useState(
    sendingIds.has(selectedChat?.id ?? ""),
  );

  const locale = useLocale();

  const { user } = useAuth();
  const { conversations, setConversations, userStatuses } = useConversation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<boolean>(false);
  const isLoadingMoreRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);

  const isMyMessage = (msg: MessageResponse) => msg.sender?.id === user?.id;

  const fetchMessages = async (conversationId: string, page = 0, size = 20) => {
    if (!selectedChat || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    try {
      const response = await messageService.getMessagesByConversationId(
        conversationId,
        page,
        size,
      );
     
      const hasMore = response.data.result.totalPages > page + 1;

      setConversations((prev) => {
        if (!prev) return prev;
        const updated = new Map(prev);
        const existing = updated.get(conversationId);
        if (existing) {
          // Clone conversation object để tránh mutate
          const conversation = { ...existing };
          const existingIds = new Set(
            conversation.messages?.map((m) => m.id) || [],
          );
          const uniqueNewItems = response.data.result.items.filter(
            (item: MessageResponse) => !existingIds.has(item.id),
          );
          conversation.messages = [
            ...uniqueNewItems,
            ...(conversation.messages || []),
          ];
          conversation.hasMore = hasMore;
          updated.set(conversationId, conversation);
        }
        return updated;
      });
      setPage(page + 1);
      const container = containerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      requestAnimationFrame(() => {
        if (isInitialLoadRef.current) {
          // Lần đầu load: scroll xuống cuối
          messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
          isInitialLoadRef.current = false;
        } else if (container) {
          // Load more: giữ nguyên vị trí scroll
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }
      });

    } catch (error) {
      console.error("Error fetching messages:", (error as any).response);
    } finally {
      isLoadingMoreRef.current = false;
    }
  };

  useEffect(() => {
    if (!selectedChat) return;

    isInitialLoadRef.current = true;
    setPage(0);
    isLoadingMoreRef.current = false;
    console.log("init fetch messages for conversation:", selectedChat.id);
    setConversations((prev) => {
      if (!prev) return prev;
      const updated = new Map(prev);
      const conversation = updated.get(selectedChat.id);
      if (conversation) {
        conversation.messages = [];
        conversation.hasMore = true;
        updated.set(selectedChat.id, conversation);
      }
      return updated;
    });

    fetchMessages(selectedChat.id, 0, 20);

    return () => {
      isLoadingMoreRef.current = false;
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    setSending(sendingIds.has(selectedChat?.id ?? ""));
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("Scrolled to bottom");
    setConversations((prev) => {
      if (!prev || !selectedChat) return prev;
      const updated = new Map(prev);
      const conversation = updated.get(selectedChat.id);
      if (conversation) {
        conversation.myParticipant.unreadCount = 0;
        updated.set(selectedChat.id, conversation);
      }
      return updated;
    });
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat?.id || !user || sending) return;
    webSocketService.sendTyping(selectedChat.id, false);
    setSending(true);
    setSendingIds((prev) => new Set(prev).add(selectedChat.id));
    if (selectedChat.ai) {
      const messageToSend = message;
      setMessage("");
      const myMessage: MessageResponse = {
        id: `temp-${Date.now()}`,
        content: messageToSend,
        sender: user,
        conversationId: selectedChat.id,
        createdAt: new Date().toISOString(),
        parent: parentMessage || null,
        courseRecommendations: [],
      };
      try {
        setConversations((prev) => {
          if (!prev) return prev;
          const updated = new Map(prev);
          const conversation = updated.get(selectedChat.id);
          if (conversation) {
            if (!conversation.messages.some((msg) => msg.id === myMessage.id)) {
              conversation.messages = [
                ...(conversation.messages || []),
                myMessage,
              ];
              conversation.lastMessage = myMessage;
              conversation.lastMessageAt = myMessage.createdAt;
              conversation.typingAvatarFileName = "ai-avatar.svg";
            }
            updated.set(selectedChat.id, conversation);
          }
          return updated;
        });
        scrollToBottom();
        const response = await aiService.chat({
          conversationId: selectedChat.id,
          content: messageToSend,
          parentId: parentMessage?.id || null,
        });
        const newMessage = response.data.result;
        setConversations((prev) => {
          if (!prev) return prev;
          const updated = new Map(prev);
          const conversation = updated.get(selectedChat.id);
          if (conversation) {
            if (
              !conversation.messages.some((msg) => msg.id === newMessage.id)
            ) {
              conversation.messages = [...conversation.messages, newMessage];
              conversation.lastMessage = newMessage;
            }
            updated.set(selectedChat.id, conversation);
          }
          return updated;
        });
      } catch (error) {
        console.error("Error sending AI message:", (error as any).response);
      } finally {
        setSending(false);
        setConversations((prev) => {
          if (!prev) return prev;
          const updated = new Map(prev);
          const conversation = updated.get(selectedChat.id);
          if (conversation) {
            conversation.typingAvatarFileName = null;
            updated.set(selectedChat.id, conversation);
          }
          return updated;
        });
        setSendingIds((prev) => {
          const next = new Set(prev);
          next.delete(selectedChat.id);
          return next;
        });
        scrollToBottom();
      }
      return;
    }
    webSocketService.sendMessage(
      selectedChat.id,
      message,
      parentMessage?.id || null,
    );
    setMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      webSocketService.sendTyping(selectedChat?.id || "", false);
      return;
    }

    webSocketService.sendTyping(selectedChat?.id || "", true);
  };

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

  const isUserFirstMessageInGroup = (index: number) => {
    if (!selectedChat) return true;
    const messages = conversations?.get(selectedChat.id)?.messages;
    if (!messages || index === 0) return true;

    const current = messages[index];
    const prev = messages[index - 1];

    const isDifferentSender = prev.sender?.id !== current.sender?.id;
    const isTimeExceeded =
      new Date(messages[index].createdAt).getTime() -
        new Date(messages[index - 1].createdAt).getTime() >
      5 * 60 * 1000;

    return isDifferentSender || isTimeExceeded;
  };

  const isUserLastMessageInGroup = (index: number) => {
    if (!selectedChat) return true;
    const messages = conversations?.get(selectedChat.id)?.messages;
    if (!messages || index === messages.length - 1) return true;
    const isDifferentSender =
      messages[index + 1]?.sender?.id !== messages[index]?.sender?.id;
    const isTimeExceeded =
      new Date(messages[index + 1].createdAt).getTime() -
        new Date(messages[index].createdAt).getTime() >
      5 * 60 * 1000;
    return isDifferentSender || isTimeExceeded;
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

  useEffect(() => {
    if (!topSentinelRef.current || !selectedChat) return;

    const conversation = conversations?.get(selectedChat.id);
    if (!conversation?.hasMore) return;
    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry.isIntersecting) return;
        if (loadMoreRef.current) return;
        if (!conversations?.get(selectedChat.id)?.hasMore) return;
        if (page === 0) return;

        console.log("Loading more messages... with page:", page);
        const conv = conversations?.get(selectedChat.id);
        if (!conv?.hasMore) return;

        await fetchMessages(selectedChat.id, page, 20);
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [selectedChat, conversations]);

  useEffect(() => {
    if (!messagesEndRef.current || !selectedChat) return;
    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          setConversations((prev) => {
            if (!prev || !selectedChat) return prev;
            const updated = new Map(prev);
            const conversation = updated.get(selectedChat.id);
            if (conversation) {
              conversation.myParticipant.unreadCount = 0;
              updated.set(selectedChat.id, conversation);
            }
            return updated;
          });
          webSocketService.markAsRead(selectedChat.id);
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(messagesEndRef.current);

    return () => observer.disconnect();
  }, [selectedChat]);

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
                Online{" "}
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

      <div
        className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900"
        ref={containerRef}
      >
        <div ref={topSentinelRef} className="h-px"></div>{" "}
        {conversations?.get(selectedChat?.id)?.messages === null ||
        conversations?.get(selectedChat?.id)?.messages?.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-muted mt-36">
            <div>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="text-3xl text-gray-400 dark:text-muted mb-4"
              />
            </div>
            No messages yet. Start the conversation now!
          </div>
        ) : (
          (conversations?.get(selectedChat?.id)?.messages ?? []).map(
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
                    className={`max-w-md flex ${isMyMessage(msg) ? "order-2" : "order-1"}
                    ${isUserLastMessageInGroup(index) ? "mb-2" : "mb-[2px]"} 
                    `}
                  >
                    {!isMyMessage(msg) && isUserFirstMessageInGroup(index) && (
                      <img
                        src={
                          selectedChat.ai
                            ? "/ai-avatar.svg"
                            : msg.sender?.profile?.avatarUrl ||
                              "/default-avatar.jpg"
                        }
                        alt="Sender Avatar"
                        className={`w-8 h-8 rounded-full object-cover mr-3 mt-auto mb-1 ${isUserLastMessageInGroup(index) ? "mb-6" : ""}`}
                      />
                    )}
                    <div>
                      {!isMyMessage(msg) &&
                        isUserFirstMessageInGroup(index) && (
                          <p className="text-xs  text-gray-500 dark:text-muted  mb-1">
                            {msg.sender?.firstName || "Unknown User"}
                          </p>
                        )}
                      <div
                        className={`px-4 py-2 group rounded-sm relative ${!isUserFirstMessageInGroup(index) && !isMyMessage(msg) && "ml-11"} ${
                          isMyMessage(msg)
                            ? `bg-linear-to-tr from-primary to-secondary rounded-l-2xl text-white ${isUserLastMessageInGroup(index) && "rounded-br-2xl"} ${isUserFirstMessageInGroup(index) && "rounded-tr-2xl"}`
                            : `bg-white dark:bg-surface text-gray-900 dark:text-text rounded-r-2xl ${isUserLastMessageInGroup(index) && "rounded-bl-2xl"} ${isUserFirstMessageInGroup(index) && "rounded-tl-2xl"}`
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap wrap-break-words">
                          {msg.content}
                        </p>
                        <div
                          className={`absolute ${
                            isMyMessage(msg)
                              ? "-left-2 -translate-x-full"
                              : "-right-2 translate-x-full"
                          } top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}
                        >
                          <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                            {/* Arrow pointing to message */}
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 ${
                                isMyMessage(msg)
                                  ? "right-0 translate-x-full"
                                  : "left-0 -translate-x-full"
                              }`}
                            >
                              <div
                                className={`w-0 h-0 border-4 ${
                                  isMyMessage(msg)
                                    ? "border-l-gray-200 dark:border-l-gray-700 border-y-transparent border-r-transparent"
                                    : "border-r-gray-200 dark:border-r-gray-700 border-y-transparent border-l-transparent"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {msg.courseRecommendations &&
                        msg.courseRecommendations.length > 0 && (
                          <div className="flex flex-col gap-3 mt-3">
                            {msg.courseRecommendations.map((course) => (
                              <Link
                                href={`/${locale}/courses/${course.courseId}`}
                                key={course.courseId}
                                className="group block bg-white dark:bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-white/5"
                              >
                                <div className="relative w-full h-28 overflow-hidden">
                                  <img
                                    src={
                                      course.thumbnailUrl ||
                                      "/default-course-background.png"
                                    }
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                                    ✦{" "}
                                    {(course.similarityScore * 100).toFixed(0)}%
                                    match
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 flex flex-col gap-2">
                                  {/* Title */}
                                  <p className="font-semibold text-sm text-gray-800 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                    {course.title}
                                  </p>

                                  {/* Tags row */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                      {course.category}
                                    </span>
                                    <span
                                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getLevelClassName(course.level)}`}
                                    >
                                      {course.level}
                                    </span>
                                  </div>

                                  {/* Reason */}
                                  <p className="text-[11px] text-gray-400 dark:text-muted leading-relaxed line-clamp-2">
                                    {course.reason}
                                  </p>

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5">
                                    <span className="text-sm font-bold text-primary">
                                      ${course.originalPrice}
                                    </span>
                                    <span className="text-[10px] text-gray-400 dark:text-muted group-hover:text-primary transition-colors">
                                      View course →
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      {/* <div
                        className={`flex items-center gap-1 mt-1 ${!isUserFirstMessageInGroup(index) && !isMyMessage(msg) && "ml-11"} text-xs text-gray-500 dark:text-muted ${
                          isMyMessage(msg) ? "justify-end" : "justify-start"
                        }`}
                      >
                        {isUserLastMessageInGroup(index) && (
                          <span>{timeAgo(msg?.createdAt)}</span>
                        )}
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )
        )}
        {conversations?.get(selectedChat?.id)?.typingAvatarFileName && (
          <Typing
            avatarFileName={
              conversations.get(selectedChat?.id)?.typingAvatarFileName ||
              "/default-avatar.jpg"
            }
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-border bg-white dark:bg-surface">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-border flex items-center justify-center transition-colors shrink-0">
            <FontAwesomeIcon
              icon={faImage}
              className="w-5 h-5 text-gray-600 dark:text-muted"
            />
          </button>

          <div className="flex-1 relative h-full">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
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
          {sending && (
            <div className="w-10">
              <Loading size="sm" color="blue" />
            </div>
          )}
          {!sending &&
            (message.trim().length === 0 ? (
              <button
                disabled={sending}
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
                disabled={!message.trim() || sending}
                className="w-10 h-10 rounded-full  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="text-2xl text-primary hover:text-primary/80"
                />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
