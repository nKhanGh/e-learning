# Frontend Module: Settings, i18n va Theme

## Muc dich

Quan ly ngon ngu, theme light/dark va settings page.

## File chinh

- `frontend/src/app/[locale]/settings/page.tsx`
- `frontend/src/i18n/request.ts`
- `frontend/src/messages/en.json`
- `frontend/src/messages/vi.json`
- `frontend/src/app/[locale]/layout.tsx`
- `frontend/src/app/globals.css`

## i18n

Locales hien co:

- `en`
- `vi`

`i18n/request.ts` dung `next-intl/server` de load messages theo route locale. Neu locale khong hop le, app fallback ve `en`.

## Theme

- Theme duoc luu trong `localStorage` voi key `theme`.
- Script trong layout them class `dark` vao `documentElement` truoc khi render body.
- Settings page cho user doi theme va language.

## Luu y

- Khi them ngon ngu moi, can cap nhat `locales` trong `src/i18n/request.ts`, them file message moi va route/link tu settings.
- Khi them key translation, can dong bo ca `en.json` va `vi.json`.
