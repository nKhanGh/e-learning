// components/chat/ChatCreation.tsx
"use client";
import { useSearchUsersQuery } from "@/hooks/queries/useUserQueries";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSearch,
  faUsers,
  faPlus,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCreateConversationMutation } from "@/hooks/queries/useConversationQueries";

interface ChatCreationProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (conversation: ConversationResponse) => void;
}

const ChatCreation = ({ open, onClose, onCreate }: ChatCreationProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const searchUsersQuery = useSearchUsersQuery(searchTerm);
  const searchResults = searchUsersQuery.data ?? [];
  const isSearching = searchUsersQuery.isFetching;
  const createConversationMutation = useCreateConversationMutation();
  const toggleUserSelection = (user: UserResponse) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some((u) => u.id === userId);
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to start a conversation.");
      return;
    }

    try {
      const response = await createConversationMutation.mutateAsync({
        data: {
          name: selectedUsers.length > 1 ? name || "New Group" : null,
          description: selectedUsers.length > 1 ? description : null,
          participantIds: selectedUsers.map((u) => u.id),
        },
      });
      onCreate?.(response.data.result);
    } catch (error) {
      toast.error(`Failed to create conversation: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
      console.error("Error creating conversation:", error);
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedUsers([]);
    setName("");
    setDescription("");
    onClose();
  };


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm p-3.5"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="w-4 h-4 text-primary"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    New Conversation
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedUsers.length === 0
                      ? "Select people to chat with"
                      : `${selectedUsers.length} selected`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Search Users
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  />
                  <input
                    id="search"
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  {isSearching && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                    Selected ({selectedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                      >
                        <img
                          src={
                            user?.profile?.avatarUrl || "/default-avatar.jpg"
                          }
                          alt={user.firstName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchTerm.trim().length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">
                    {isSearching
                      ? "Searching..."
                      : searchResults.length > 0
                        ? `Found ${searchResults.length} user${searchResults.length > 1 ? "s" : ""}`
                        : "No users found"}
                  </label>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {searchResults.map((user) => {
                      const selected = isUserSelected(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => toggleUserSelection(user)}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-md transition-all ${
                            selected
                              ? "bg-primary/10 border-2 border-primary"
                              : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={
                                user?.profile?.avatarUrl ||
                                "/default-avatar.jpg"
                              }
                              alt={user.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {selected && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="w-2.5 h-2.5 text-white"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group Chat Options */}
                <div className="space-y-3.5 pt-3.5 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Covnersation Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter conversation name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="What's this group about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                    />
                  </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex gap-2.5">
              <button
                onClick={handleClose}
                className="flex-1 px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={selectedUsers.length === 0}
                className="flex-1 px-3.5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                Create Conversation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatCreation;
