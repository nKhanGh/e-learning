import { conversationParticipantService } from "@/services/conversationParticipant.service";
import { userService } from "@/services/user.service";
import { faCheck, faPlus, faSearch, faUsers, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const ChatAddUsers = ({
  conversationId,
  open,
  onClose,
}: {
  conversationId: string;
  open: boolean;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const searchUser = async (keyword: string) => {
    if (!keyword.trim()) return;

    setIsSearching(true);
    try {
      const response = await userService.searchUsers(keyword);
      setSearchResults(response.data.result);
      console.log("Search results:", response);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

    const isUserSelected = (userId: string) => {
    return selectedUsers.some((u) => u.id === userId);
  };

  const handleAdd = async () => {
    try{
      selectedUsers.forEach(async (user) => {
        await conversationParticipantService.add(
          conversationId,
          user.id,
        );
      });
      onClose();
    } catch (error) {
      console.error("Error adding participants:", error);
    }
  }

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchUser(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

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

  const handleClose = () => {
    setSearchTerm("");
    setSelectedUsers([]);
    setSearchResults([]);
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
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="w-5 h-5 text-primary"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add new users to conversation
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUsers.length === 0
                      ? "Select people to chat with"
                      : `${selectedUsers.length} selected`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Search Users
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  />
                  <input
                    id="search"
                    type="text"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selected ({selectedUsers.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full"
                      >
                        <img
                          src={
                            user?.profile?.avatarUrl || "/default-avatar.jpg"
                          }
                          alt={user.firstName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="w-5 h-5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchTerm.trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {isSearching
                      ? "Searching..."
                      : searchResults.length > 0
                        ? `Found ${searchResults.length} user${searchResults.length > 1 ? "s" : ""}`
                        : "No users found"}
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((user) => {
                      const selected = isUserSelected(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => toggleUserSelection(user)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
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
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            {selected && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="w-3 h-3 text-white"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={selectedUsers.length === 0}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                Add to Conversation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatAddUsers;
