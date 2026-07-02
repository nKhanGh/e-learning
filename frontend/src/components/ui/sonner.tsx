"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark"}
      position="top-right"
      closeButton
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        info: <Info className="w-4 h-4 text-blue-500" />,
        warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
        error: <XCircle className="w-4 h-4 text-red-500" />,
        loading: <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />,
        close: <X className="w-3.5 h-3.5" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-full flex items-center gap-2.5 p-3.5 pr-9 rounded-lg border shadow-lg backdrop-blur-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700",
          title: "font-semibold text-xs",
          description: "text-xs text-gray-600 dark:text-gray-400",
          actionButton:
            "ml-auto bg-primary text-white px-2.5 py-1 rounded-md text-xs font-medium hover:bg-primary/90",
          cancelButton:
            "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600",
          
          closeButton:
            "!bg-transparent !text-gray-500 dark:!text-gray-400 hover:!text-gray-700 dark:hover:!text-gray-200 hover:!bg-gray-100 dark:hover:!bg-gray-700 !border-0 !shadow-none !absolute !right-1.5 !top-1.5 !w-7 !h-7 !flex !items-center !justify-center !rounded-md transition-colors",
          
          success:
            "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800",
          error:
            "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800",
          warning:
            "bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800",
          info: "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800",
        },
      }}
    />
  );
}