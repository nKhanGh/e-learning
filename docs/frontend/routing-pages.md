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
- `frontend/src/app/[locale]/instructor/courses/page.tsx`
- `frontend/src/app/[locale]/instructor/courses/new/page.tsx`
- `frontend/src/app/[locale]/instructor/courses/[id]/edit/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/page.tsx`
- `frontend/src/app/[locale]/instructor/studio/[id]/preview/lectures/[lectureId]/page.tsx`
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
| `/:locale/instructor/courses` | `instructor/courses/page.tsx` | Instructor My Courses |
| `/:locale/instructor/courses/new` | `instructor/courses/new/page.tsx` | Tao course draft |
| `/:locale/instructor/courses/:id/edit` | `instructor/courses/[id]/edit/page.tsx` | Quick edit basic course info |
| `/:locale/instructor/studio/:id` | `instructor/studio/[id]/page.tsx` | Course Studio |
| `/:locale/instructor/studio/:id/preview/lectures/:lectureId` | `preview/lectures/[lectureId]/page.tsx` | Lecture Preview/Detail Studio |
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
- Instructor routes can role `INSTRUCTOR` hoac owner/admin tuy page.
