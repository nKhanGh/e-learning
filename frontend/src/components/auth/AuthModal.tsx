// components/auth/AuthModal.tsx
"use client";
import { useOpenAuth } from "@/contexts/OpenAuthContext";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoginForm from "./LoginForm";
import { useEffect, useState } from "react";
import SignUpForm from "./SignUpForm";

const AuthModal = () => {
  const { openLogin, setOpenLogin, openSignUp, setOpenSignUp } = useOpenAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const isOpen = openLogin || openSignUp;

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setOpenLogin(false);
      setOpenSignUp(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    globalThis.addEventListener("keydown", handleEscape);
    return () => globalThis.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-xl h-full bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:-translate-x-1 transition-all"
            onClick={handleClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {openLogin && (
            <LoginForm
              onSwitchToSignUp={() => {
                setOpenLogin(false);
                setOpenSignUp(true);
              }}
            />
          )}
          {openSignUp && (
            <SignUpForm
              onSwitchToLogin={() => {
                setOpenSignUp(false);
                setOpenLogin(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;