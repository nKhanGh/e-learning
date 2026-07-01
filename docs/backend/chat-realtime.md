# Backend Module: Chat va Realtime

## Muc dich

Ho tro conversation, participant, message, reaction, file message, typing indicator, read receipt va online presence realtime.

## File chinh

- `controller/ConversationController.java`
- `controller/ConversationParticipantController.java`
- `controller/MessageController.java`
- `controller/MessageReactionController.java`
- `service/interaction/ConversationService.java`
- `service/interaction/ConversationParticipantService.java`
- `service/interaction/MessageService.java`
- `service/interaction/MessageReactionService.java`
- `service/impl/interaction/*`
- `entity/interaction/Conversation.java`
- `entity/interaction/ConversationParticipant.java`
- `entity/interaction/Message.java`
- `entity/interaction/MessageReaction.java`
- `configuration/WebSocketConfig.java`
- `configuration/WebSocketSecurityConfig.java`
- `configuration/WebSocketEventListener.java`
- `dto/webSocket/*`

## REST API

- `GET /api/conversations`
- `GET /api/conversations/search`
- `POST /api/conversations`
- `POST /api/conversations/ai`
- `PUT /api/conversations/{conversationId}/avatar`
- `PUT /api/conversations/{conversationId}/name`
- `DELETE /api/conversations/{conversationId}`
- `POST /api/conversations/{conversationId}/participants/me`
- `DELETE /api/conversations/{conversationId}/participants/me`
- `POST /api/conversations/{conversationId}/participants`
- `DELETE /api/conversations/{conversationId}/participants/{participantId}`
- `POST /api/messages`
- `POST /api/messages/send-file`
- `GET /api/messages/conversations/{conversationId}`
- `POST /api/messages/{messageId}/reaction`
- `GET /api/messages/{messageId}/reaction`

## WebSocket/STOMP

- Endpoint: `/api/ws`
- App prefix: `/app`
- User destination prefix: `/user`

Client publish:

- `/app/chat.send`
- `/app/chat.typing`
- `/app/chat.read`
- `/app/user.online.request`

Client subscribe:

- `/user/queue/message`
- `/user/queue/typing`
- `/user/queue/unread-count`
- `/user/queue/read-receipt`
- `/user/queue/user-status-init`
- `/topic/user.online`

## Presence

Redis duoc dung de luu session/user online:

- `ws:session:{sessionId}`
- `ws:user:{userId}`
- `ws:lastSeen:{userId}`

## Test lien quan

- `controller/ConversationControllerTest.java`
- `controller/ConversationParticipantControllerTest.java`
- `controller/MessageControllerTest.java`
- `controller/MessageReactionControllerTest.java`
- `service/ConversationServiceTest.java`
- `service/ConversationParticipantServiceTest.java`
- `service/MessageServiceTest.java`
- `service/MessageReactionServiceTest.java`
