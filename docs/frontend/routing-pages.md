# Frontend Module: Routing va Pages

## Muc dich

Quan ly route tree cua Next.js App Router, layout theo locale, page rendering va provider composition.

## File chinh

- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/[locale]/layout.tsx`
- `frontend/src/app/[locale]/page.tsx`
- `frontend/src/app/[locale]/courses/page.tsx`
- `frontend/src/app/[locale]/courses/[id]/page.tsx`
- `frontend/src/app/[locale]/chat/page.tsx`
- `frontend/src/app/[locale]/settings/page.tsx`
- `frontend/src/components/layouts/Header.tsx`
- `frontend/src/components/layouts/Sidebar.tsx`
- `frontend/src/components/layouts/LayoutComponent.tsx`
- `frontend/src/components/layouts/Footer.tsx`

## Routes

| Route | Page | Mo ta |
| --- | --- | --- |
| `/` | `app/page.tsx` | Redirect/default entry |
| `/:locale` | `[locale]/page.tsx` | Home page, featured courses |
| `/:locale/courses` | `[locale]/courses/page.tsx` | Search/list course |
| `/:locale/courses/:id` | `[locale]/courses/[id]/page.tsx` | Course detail |
| `/:locale/chat` | `[locale]/chat/page.tsx` | Chat UI |
| `/:locale/settings` | `[locale]/settings/page.tsx` | Settings/theme/language |

## Provider composition

`[locale]/layout.tsx` boc app bang:

- `NextIntlClientProvider`
- `AuthProvider`
- `OpenAuthProvider`
- Layout shell (`Header`, `Sidebar`)
- `Toaster`
- `Footer`

`chat/page.tsx` boc rieng:

- `WebSocketProvider`
- `ConversationProvider`

## Luu y

- Layout co import `WebSocketProvider` nhung hien tai provider nay chi duoc dung trong chat page.
- Home va course detail dung `NEXT_PUBLIC_APP_API_URL` thong qua shared API helper.
