import { conversationParticipantService } from "@/services/conversationParticipant.service";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const ChatLeaveModal = ({open, onClose, conversationId}: {open: boolean; onClose: () => void; conversationId: string}) => {
  
  const handleLeave = async () => {
    try {
      await conversationParticipantService.leave(conversationId);
      onClose();
      toast.success("You have left the conversation.");
    } catch (error) {
      toast.error(`Failed to leave conversation: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
      console.error("Error leaving conversation:", error);
    } finally {
      setTimeout(() => {
        globalThis.location.reload();
      }, 500);
    }
  }
  
  return  (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 py-12 flex-1 flex flex-col items-center justify-center relative">
              <button>
                <FontAwesomeIcon
                  icon={faXmark}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  onClick={onClose}
                />
              </button>
              <h2 className="text-2xl font-semibold mb-4">
                Are you sure you want to leave this conversation?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You will be removed from the conversation and will not be able to participate further.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="py-2 bg-gray-200 w-32 flex items-center justify-center dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeave}
                  className="py-2 w-32 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Leave
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChatLeaveModal;