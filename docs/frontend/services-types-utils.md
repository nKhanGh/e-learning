# Frontend Module: Services, Types va Utilities

## Muc dich

Gom cac API client, query hooks, type declaration va helper dung chung cho frontend.

## Services

| File | Vai tro |
| --- | --- |
| `services/auth.service.ts` | Login, signup, logout, refresh token |
| `services/user.service.ts` | My info, search users |
| `services/course.service.ts` | Search/get course, instructor course CRUD support, sections, lectures, quizzes, quiz questions, publish checklist |
| `services/courseCategory.service.ts` | Get categories |
| `services/enrollment.service.ts` | Get my enrollment |
| `services/conversation.service.ts` | Conversation CRUD/search/AI |
| `services/conversationParticipant.service.ts` | Add/leave participant |
| `services/message.service.ts` | Get messages |
| `services/ai.service.ts` | AI chat |

## Utils va client state

| File | Vai tro |
| --- | --- |
| `lib/apiClient.ts` | Axios singleton, attach token, refresh token khi 401 |
| `lib/queryKeys.ts` | Query key factory dung chung |
| `lib/courseSearch.ts` | Default course search filter |
| `providers/QueryProvider.tsx` | TanStack Query provider va default cache options |
| `hooks/queries/*` | TanStack Query hooks cho auth, course, enrollment, conversation, message, user search |
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
| `types/course.d.ts` | Course/search/category/curriculum/instructor studio/publish checklist model |
| `types/enrollment.d.ts` | Enrollment model |
| `types/conversation.d.ts` | Conversation model |
| `types/message.d.ts` | Message model |
| `types/enums/*` | Enum dung chung |

## Axios flow

1. Service import shared `apiClient`.
2. Request interceptor doc `learnioAccessToken` tu localStorage.
3. Token duoc gan vao `Authorization`.
4. Response interceptor bat 401 va thu refresh token qua `/auth/refreshtToken`.
5. Neu refresh fail, token bi xoa va app dispatch event logout.

## TanStack Query

- `QueryProvider` boc app trong route locale layout.
- Query keys nam trong `lib/queryKeys.ts`.
- Default stale time la 60 giay va `refetchOnWindowFocus` tat de tranh request lap lai qua nhieu.
- Course search, categories, instructor course list, course detail, curriculum, sections, lectures, quiz, quiz questions, publish checklist, enrollment, conversations, messages va user search deu co query hook rieng.
- Instructor mutations invalidate course detail/list, curriculum, sections, lectures, quiz, questions va publish checklist de UI khong dung cache cu.
