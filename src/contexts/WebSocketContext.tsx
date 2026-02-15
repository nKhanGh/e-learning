'use client';
import { createContext, useEffect, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import webSocketService from "@/utils/WebSocketService";

type WebSocketContextType = {};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, isLoggedIn } = useAuth();
  const isConnected = useRef(false);

  useEffect(() => {
    console.log("WebSocketProvider useEffect triggered with accessToken:", accessToken, "isLoggedIn:", isLoggedIn);
    if (isLoggedIn && accessToken) {
      if (isConnected.current) {
        console.log("WebSocket already connected, skipping...");
        return;
      }

      console.log("🔌 Connecting WebSocket...");
      webSocketService.connect(accessToken);
      isConnected.current = true;

      return () => {
        console.log("🔌 Disconnecting WebSocket...");
        webSocketService.disconnect();
        isConnected.current = false;
      };
    }
  }, [accessToken, isLoggedIn]);

  const contextValue = useMemo(() => ({}), []);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
