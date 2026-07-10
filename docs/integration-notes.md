# Luu y tich hop Frontend/Backend

Tai lieu nay ghi lai trang thai dong bo giua frontend service va backend controller hien tai.

## Endpoint da dong bo o frontend

| Chuc nang | Frontend hien goi | Backend hien expose |
| --- | --- | --- |
| Dang ky | `POST /auth/register` | `POST /auth/register` |
| Refresh token | `POST /auth/refreshtToken` | `POST /auth/refreshtToken` |
| Course search | `POST /courses/search` | `POST /courses/search` |
| Course curriculum | `GET /courses/{id}/curriculum` | `GET /courses/{id}/curriculum` |
| Course enrollment status | `GET /courses/{id}/enrollment-status` | `GET /courses/{id}/enrollment-status` |
| Publish checklist | `GET /courses/{id}/publish-checklist` | `GET /courses/{id}/publish-checklist` |
| Submit review | `POST /courses/{id}/submit-review` | `POST /courses/{id}/submit-review` |
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

## Luu y course authoring

- Instructor preview khong dung student curriculum lam source duy nhat vi student curriculum co the loc unpublished/empty section.
- Teacher preview dung `/course-sections/course/{courseId}` va `/lectures/section/{sectionId}` de hien full structure.
- Backend va frontend deu sort section/lecture theo `displayOrder`.
- Thumbnail hien tai la URL, frontend co fallback neu URL anh sai. Upload file that chua co.
