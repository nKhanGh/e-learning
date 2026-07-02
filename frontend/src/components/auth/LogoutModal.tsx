import { logout } from "@/utils/auth";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

const LogoutModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const handleLogout = () => {
    try {
      logout();
      onClose();
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error(
        `Logout failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
      console.error("Logout error:", error);
    }
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 w-full max-w-md max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 py-10 flex-1 flex flex-col items-center justify-center relative">
              <button>
                <FontAwesomeIcon
                  icon={faXmark}
                  className="absolute top-3.5 right-3.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  onClick={onClose}
                />
              </button>
              <h2 className="text-xl font-semibold mb-3.5">
                Are you sure you want to log out?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-5 text-center">
                You will need to log in again to access your account.
              </p>
              <div className="flex space-x-3.5">
                <button
                  onClick={onClose}
                  className="py-1.5 bg-gray-200 w-28 flex items-center justify-center dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="py-1.5 w-28 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-700 transition"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
