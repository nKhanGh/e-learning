# Frontend Module: Chat va Realtime UI

## Muc dich

Hien thi chat sidebar, main chat, info panel, tao conversation, them user, leave modal, dong bo realtime message/typing/read/presence.

## File chinh

- `frontend/src/app/[locale]/chat/page.tsx`
- `frontend/src/components/chat/ChatSidebar.tsx`
- `frontend/src/components/chat/ChatMain.tsx`
- `frontend/src/components/chat/ChatInfo.tsx`
- `frontend/src/components/chat/ChatCreation.tsx`
- `frontend/src/components/chat/ChatAddUsers.tsx`
- `frontend/src/components/chat/ChatLeaveModal.tsx`
- `frontend/src/contexts/ConversationContext.tsx`
- `frontend/src/contexts/WebSocketContext.tsx`
- `frontend/src/utils/WebSocketService.ts`
- `frontend/src/services/conversation.service.ts`
- `frontend/src/services/conversationParticipant.service.ts`
- `frontend/src/services/message.service.ts`
- `frontend/src/services/ai.service.ts`
- `frontend/src/hooks/queries/useConversationQueries.ts`
- `frontend/src/hooks/queries/useMessageQueries.ts`
- `frontend/src/hooks/queries/useUserQueries.ts`
- `frontend/src/types/conversation.d.ts`
- `frontend/src/types/message.d.ts`

## REST API service

- `GET /conversations`
- `GET /conversations/search`
- `POST /conversations`
- `POST /conversations/ai`
- `PUT /conversations/{conversationId}/avatar`
- `PUT /conversations/{conversationId}/name`
- `DELETE /conversations/{conversationId}`
- `POST /conversations/{conversationId}/participants`
- `DELETE /conversations/{conversationId}/participants/me`
- `GET /messages/conversations/{conversationId}`
- `POST /ai/chat`

## Server state

Conversation list, user search, message pages va create conversation mutations duoc quan ly qua TanStack Query. WebSocket event van cap nhat context realtime de UI phan hoi ngay.

## WebSocket

`WebSocketService` ket noi SockJS/STOMP toi `NEXT_PUBLIC_WS_API_URL`.

Subscribe:

- `/user/queue/user-status-init`
- `/user/queue/message`
- `/user/queue/typing`
- `/user/queue/unread-count`
- `/user/queue/read-receipt`
- `/topic/user.online`

Publish:

- `/app/user.online.request`
- `/app/chat.send`
- `/app/chat.typing`
- `/app/chat.read`

## State trong ConversationContext

- `conversations`: map conversation id -> conversation.
- `userStatuses`: online/offline/lastSeen theo user id.
- `unreadCount`: tong unread.
- `wsConnected`: trang thai websocket.
