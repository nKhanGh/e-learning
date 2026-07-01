# Frontend

Frontend nam trong `frontend`, la Next.js App Router client cua Learnio.

## Stack

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- next-intl
- Axios
- SockJS + STOMP
- Radix UI, shadcn, lucide-react
- Font Awesome
- framer-motion

## Cau truc source

```text
frontend/src/
|-- app/
|-- components/
|-- contexts/
|-- i18n/
|-- lib/
|-- messages/
|-- services/
|-- types/
`-- utils/
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Bien moi truong

```env
NEXT_PUBLIC_APP_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_API_URL=http://localhost:8080/api/ws
NEXT_PUBLIC_AVATAR_BASE_URL=http://localhost:8080/api/files/avatars/
```

## Module docs

- [Routing va Pages](frontend/routing-pages.md)
- [Authentication UI](frontend/authentication.md)
- [Course Experience](frontend/course-experience.md)
- [Chat va Realtime UI](frontend/chat-realtime.md)
- [Settings, i18n va Theme](frontend/settings-i18n-theme.md)
- [Services, Types va Utilities](frontend/services-types-utils.md)
