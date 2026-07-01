# Frontend Module: Services, Types va Utilities

## Muc dich

Gom cac API client, type declaration va helper dung chung cho frontend.

## Services

| File | Vai tro |
| --- | --- |
| `services/auth.service.ts` | Login, signup, logout, refresh token |
| `services/user.service.ts` | My info, search users |
| `services/course.service.ts` | Search course, get course |
| `services/courseCategory.service.ts` | Get categories |
| `services/enrollment.service.ts` | Get my enrollment |
| `services/conversation.service.ts` | Conversation CRUD/search/AI |
| `services/conversationParticipant.service.ts` | Add/leave participant |
| `services/message.service.ts` | Get messages |
| `services/ai.service.ts` | AI chat |

## Utils

| File | Vai tro |
| --- | --- |
| `utils/useAxios.ts` | Tao Axios instance, attach token, refresh token khi 401 |
| `utils/WebSocketService.ts` | Singleton STOMP client, reconnect, subscribe/publish chat events |
| `utils/auth.ts` | Login/logout helper thao tac localStorage va auth service |
| `utils/time.ts` | Format relative time |
| `lib/utils.ts` | Utility chung cho className/shadcn style |

## Types

| File/Nhom | Vai tro |
| --- | --- |
| `types/ApiResponse.d.ts` | Contract response chung |
| `types/PageResponse.d.ts` | Contract paging |
| `types/auth.d.ts` | Auth request/response |
| `types/user.d.ts` | User model |
| `types/course.d.ts` | Course/search/category model |
| `types/enrollment.d.ts` | Enrollment model |
| `types/conversation.d.ts` | Conversation model |
| `types/message.d.ts` | Message model |
| `types/enums/*` | Enum dung chung |

## Axios flow

1. Service import `useAxios`.
2. Request interceptor doc `learnioAccessToken` tu localStorage.
3. Token duoc gan vao `Authorization`.
4. Response interceptor bat 401 va thu refresh token.
5. Neu refresh fail, token bi xoa va app dispatch event logout.

## Luu y

`useAxios` hien la factory function dat ten nhu hook nhung duoc goi o module scope trong services. Neu can dung React hooks thuc su trong tuong lai, nen doi ten thanh `createAxiosClient` hoac tao singleton ro rang hon.
