# Luu y tich hop Frontend/Backend

Tai lieu nay ghi lai cac diem can dong bo giua frontend service va backend controller hien tai.

## Endpoint chua khop

| Chuc nang | Frontend dang goi | Backend hien expose | De xuat |
| --- | --- | --- | --- |
| Dang ky | `POST /auth/signup` | `POST /auth/register` | Doi FE sang `/auth/register` hoac them alias BE |
| Refresh token | `POST /auth/refresh` | `POST /auth/refreshtToken` | Doi BE thanh `/auth/refresh-token`/`/auth/refresh` va giu alias cu neu can |
| Course search | `GET /courses/search` | `POST /courses/search` | Doi FE sang POST body filter hoac them GET endpoint |
| My enrollment | `GET /course/{id}/enrollments/me` | `GET /courses/{id}/enrollments/me` | Doi FE sang `/courses/...` |
| Doi avatar conversation | `POST /conversations/{id}/avatar` | `PUT /conversations/{id}/avatar` | Doi FE sang PUT |
| Doi description conversation | `PUT /conversations/{id}/description` | Chua co | Them BE endpoint hoac xoa method FE |

## Hardcoded URL

Mot so page frontend fetch truc tiep `http://localhost:8080/api/...`:

- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/courses/[id]/page.tsx`

Nen dung `NEXT_PUBLIC_APP_API_URL` hoac API helper chung de deploy duoc tren moi truong khac.

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

## README cu bi encoding

`frontend/README.md` hien co dau hieu mojibake cho icon/Unicode. README root moi dung ASCII de tranh loi hien thi.
