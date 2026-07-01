// services/WebSocketService.ts
import SockJS from "sockjs-client";
import { Client, IFrame } from "@stomp/stompjs";

const WS_URL = process.env.NEXT_PUBLIC_WS_API_URL || "";

type EventType =
  | "message"
  | "typing"
  | "unread"
  | "readReceipt"
  | "connected"
  | "disconnected"
  | "error"
  | "userStatus"
  | "notification";

type EventCallback = (data: any) => void;

interface MessagePayload {
  conversationId: string;
  parentId: string | null;
  content: string;
}


interface ReadRequest {
  conversationId: string;
}

class WebSocketService {
  private stompClient: Client | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private isIntentionalDisconnect: boolean = false;

  private readonly eventQueue: Map<EventType, any[]> = new Map([
    ["userStatus", []],
    ["notification", []],
    ["message", []],
    ["typing", []],
    ["unread", []],
    ["readReceipt", []],
  ]);

  private readonly listeners: Map<EventType, EventCallback[]> = new Map([
    ["message", []],
    ["typing", []],
    ["unread", []],
    ["readReceipt", []],
    ["connected", []],
    ["disconnected", []],
    ["error", []],
    ["userStatus", []],
    ["notification", []],
  ]);

  on(event: EventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      console.warn(`[WebSocket] Unknown event type: ${event}`);
      return;
    }

    const callbacks = this.listeners.get(event) || [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);

    // Process queued events
    const queuedEvents = this.eventQueue.get(event) || [];
    if (queuedEvents.length > 0) {
      queuedEvents.forEach((data) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in callback for ${event}:`, error);
        }
      });
      this.eventQueue.set(event, []);
    }
  }

  /**
   * Unregister event listener
   */
  off(event: EventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      this.listeners.set(event, callbacks);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: EventType, payload: any): void {
    const callbacks = this.listeners.get(event) || [];

    if (callbacks.length === 0) {
      // Queue event if no listeners yet
      const queue = this.eventQueue.get(event) || [];
      queue.push(payload);
      this.eventQueue.set(event, queue);
      return;
    }

    callbacks.forEach((cb) => {
      try {
        cb(payload);
      } catch (error) {
        console.error(`[WebSocket] Error in callback for ${event}:`, error);
        this.emit("error", { event, error });
      }
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    // Validate inputs
    console.log("[WebSocket] Attempting to connect with token:", token ? "****" : "null");
    if (!token) {
      console.error("[WebSocket] Token is required");
      this.emit("error", { message: "Token is required" });
      return;
    }

    if (!WS_URL) {
      console.error("[WebSocket] WS_URL is not configured");
      this.emit("error", { message: "WebSocket URL not configured" });
      return;
    }

    // Already connected
    if (this.stompClient?.connected) {
      console.log("[WebSocket] Already connected");
      return;
    }

    this.token = token;
    this.isIntentionalDisconnect = false;

    try {
      console.log("[WebSocket] Connecting to:", WS_URL);

      const socket = new SockJS(WS_URL);
      this.stompClient = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[WebSocket Debug]", str);
          }
        },
        reconnectDelay: 0, // Disable auto-reconnect, we handle it manually
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      // Connection success
      this.stompClient.onConnect = (frame: IFrame) => {
        console.log("[WebSocket] Connected successfully");
        this.reconnectAttempts = 0;
        this.emit("connected", { timestamp: Date.now() });
        this.setupSubscriptions();
        this.stompClient?.publish({
        destination: '/app/user.online.request',
        body: JSON.stringify({}),
      });
      };

      // Connection error
      this.stompClient.onStompError = (frame: IFrame) => {
        console.error("[WebSocket] STOMP error:", frame.headers["message"]);
        this.emit("error", {
          type: "stomp",
          message: frame.headers["message"],
          body: frame.body,
        });
      };

      // Web Socket error
      this.stompClient.onWebSocketError = (event: any) => {
        console.error("[WebSocket] WebSocket error:", event);
        this.emit("error", { type: "websocket", event });
      };

      // Disconnection
      this.stompClient.onDisconnect = () => {
        console.log("[WebSocket] Disconnected");
        this.emit("disconnected", { timestamp: Date.now() });

        // Auto reconnect if not intentional
        if (!this.isIntentionalDisconnect) {
          this.handleReconnect();
        }
      };

      // Activate connection
      this.stompClient.activate();
      
    } catch (error) {
      console.error("[WebSocket] Connection error:", error);
      this.emit("error", { type: "connection", error });
      this.handleReconnect();
    }
  }

  /**
   * Setup all subscriptions
   */
  private setupSubscriptions(): void {
    if (!this.stompClient?.connected) {
      console.warn("[WebSocket] Cannot setup subscriptions - not connected");
      return;
    }

    try {
      // User status initialization
      this.stompClient.subscribe("/user/queue/user-status-init", (message) => {
        try {
          const list = JSON.parse(message.body);
          if (Array.isArray(list)) {
            list.forEach((user) => this.emit("userStatus", user));
          }
        } catch (error) {
          console.error("[WebSocket] Error parsing user-status-init:", error);
          this.emit("error", { subscription: "user-status-init", error });
        }
      });

      // Private messages
      this.stompClient.subscribe("/user/queue/message", (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("[WebSocket] Received message:", data.data);
          this.emit("message", data.data);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
          this.emit("error", { subscription: "message", error });
        }
      });

      // Typing indicators
      this.stompClient.subscribe("/user/queue/typing", (message) => {
        try {
          const data = JSON.parse(message.body);
          this.emit("typing", data.data);
        } catch (error) {
          console.error("[WebSocket] Error parsing typing:", error);
          this.emit("error", { subscription: "typing", error });
        }
      });

      // Unread count
      this.stompClient.subscribe("/user/queue/unread-count", (message) => {
        try {
          const data = JSON.parse(message.body);
          this.emit("unread", data.data);
        } catch (error) {
          console.error("[WebSocket] Error parsing unread-count:", error);
          this.emit("error", { subscription: "unread-count", error });
        }
      });

      // Read receipts
      this.stompClient.subscribe("/user/queue/read-receipt", (message) => {
        try {
          const data = JSON.parse(message.body);
          this.emit("readReceipt", data.data);
        } catch (error) {
          console.error("[WebSocket] Error parsing read-receipt:", error);
          this.emit("error", { subscription: "read-receipt", error });
        }
      });

      // User online status (public topic)
      this.stompClient.subscribe("/topic/user.online", (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log("[WebSocket] Received user.online update:", data);
          this.emit("userStatus", data);
        } catch (error) {
          console.error("[WebSocket] Error parsing user.online:", error);
          this.emit("error", { subscription: "user.online", error });
        }
      });

      console.log("[WebSocket] All subscriptions setup successfully");
    } catch (error) {
      console.error("[WebSocket] Error setting up subscriptions:", error);
      this.emit("error", { type: "subscription", error });
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.isIntentionalDisconnect) {
      console.log("[WebSocket] Intentional disconnect - not reconnecting");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] Max reconnect attempts reached");
      this.emit("error", {
        type: "reconnect",
        message: "Max reconnection attempts exceeded",
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Send a chat message
   */
  sendMessage(
    conversationId: string,
    content: string,
    parentId: string | null = null
  ): boolean {
    if (!this.stompClient?.connected) {
      console.error("[WebSocket] Cannot send message - not connected");
      this.emit("error", { action: "sendMessage", message: "Not connected" });
      return false;
    }

    if (!conversationId || !content?.trim()) {
      console.error("[WebSocket] Invalid message parameters");
      return false;
    }

    try {
      console.log("[WebSocket] Sending message:", { conversationId, parentId, content });
      const payload: MessagePayload = {
        conversationId,
        parentId,
        content: content.trim(),
      };

      this.stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });

      return true;
    } catch (error) {
      console.error("[WebSocket] Error sending message:", error);
      this.emit("error", { action: "sendMessage", error });
      return false;
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, typing: boolean = true): boolean {
    if (!this.stompClient?.connected) {
      return false;
    }

    if (!conversationId) {
      console.error("[WebSocket] Invalid conversationId for typing");
      return false;
    }

    try {
      const payload: TypingRequest = { conversationId, typing };
      console.log("[WebSocket] Sending typing indicator:", payload);

      this.stompClient.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify(payload),
      });

      return true;
    } catch (error) {
      console.error("[WebSocket] Error sending typing:", error);
      this.emit("error", { action: "sendTyping", error });
      return false;
    }
  }

  /**
   * Mark conversation as read
   */
  markAsRead(conversationId: string): boolean {
    if (!this.stompClient?.connected) {
      return false;
    }

    if (!conversationId) {
      console.error("[WebSocket] Invalid conversationId for markAsRead");
      return false;
    }

    try {
      const payload: ReadRequest = { conversationId };

      this.stompClient.publish({
        destination: "/app/chat.read",
        body: JSON.stringify(payload),
      });

      return true;
    } catch (error) {
      console.error("[WebSocket] Error marking as read:", error);
      this.emit("error", { action: "markAsRead", error });
      return false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    console.log("[WebSocket] Disconnecting...");
    this.isIntentionalDisconnect = true;

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Deactivate client
    if (this.stompClient?.connected) {
      try {
        this.stompClient.deactivate();
      } catch (error) {
        console.error("[WebSocket] Error during disconnect:", error);
      }
    }

    // Reset state
    this.stompClient = null;
    this.token = null;
    this.reconnectAttempts = 0;

    // Clear queues and listeners
    this.eventQueue.clear();
    this.listeners.forEach((callbacks, key) => {
      this.listeners.set(key, []);
    });

    console.log("[WebSocket] Disconnected and cleaned up");
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.stompClient?.connected ?? false;
  }

  /**
   * Get current reconnect attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  /**
   * Force reconnect
   */
  reconnect(): void {
    if (this.token) {
      console.log("[WebSocket] Forcing reconnect...");
      this.disconnect();
      this.reconnectTimer = setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        }
      }, 1000);
    } else {
      console.error("[WebSocket] Cannot reconnect - no token available");
    }
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

// Cleanup on window unload (browser only)
if (typeof globalThis.window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    webSocketService.disconnect();
  });
}

export default webSocketService;