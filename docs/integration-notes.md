# Luu y tich hop Frontend/Backend

Tai lieu nay ghi lai trang thai dong bo giua frontend service va backend controller hien tai.

## Endpoint da dong bo o frontend

| Chuc nang | Frontend hien goi | Backend hien expose |
| --- | --- | --- |
| Dang ky | `POST /auth/register` | `POST /auth/register` |
| Refresh token | `POST /auth/refreshtToken` | `POST /auth/refreshtToken` |
| Course search | `POST /courses/search` | `POST /courses/search` |
| My enrollment | `GET /courses/{id}/enrollments/me` | `GET /courses/{id}/enrollments/me` |
| Doi avatar conversation | `PUT /conversations/{id}/avatar` | `PUT /conversations/{id}/avatar` |

## URL backend

Frontend dung `NEXT_PUBLIC_APP_API_URL` thong qua `frontend/src/lib/apiClient.ts`.

Nhung page da duoc chuyen khoi hardcoded `http://localhost:8080/api/...`:

- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/courses/[id]/page.tsx`

## WebSocket

Backend context path la `/api`, WebSocket endpoint la `/ws`, vi vay frontend env nen la:

```env
NEXT_PUBLIC_WS_API_URL=http://localhost:8080/api/ws
```

Client va server dang khop cac STOMP destination chinh:

- `/app/chat.send`
- `/app/chat.typing`
- `/app/chat.read`
- `/app/user.online.request`
- `/user/queue/message`
- `/user/queue/typing`
- `/user/queue/unread-count`
- `/user/queue/read-receipt`
- `/user/queue/user-status-init`
- `/topic/user.online`

## Luu y backend nen lam dep sau

`/auth/refreshtToken` dang la typo trong backend contract. Frontend hien da dong bo theo backend de chay dung, nhung nen them endpoint moi nhu `/auth/refresh` hoac `/auth/refresh-token` roi deprecate endpoint cu.
