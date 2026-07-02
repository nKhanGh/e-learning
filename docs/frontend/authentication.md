# Frontend Module: Authentication UI

## Muc dich

Quan ly login/register/logout UI, auth modal, token localStorage va thong tin user hien tai.

## File chinh

- `frontend/src/components/auth/AuthModal.tsx`
- `frontend/src/components/auth/LoginForm.tsx`
- `frontend/src/components/auth/SignUpForm.tsx`
- `frontend/src/components/auth/LogoutModal.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/OpenAuthContext.tsx`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/user.service.ts`
- `frontend/src/utils/auth.ts`
- `frontend/src/lib/apiClient.ts`
- `frontend/src/hooks/queries/useAuthQueries.ts`
- `frontend/src/types/auth.d.ts`
- `frontend/src/types/user.d.ts`

## State va storage

- `learnioAccessToken`
- `learnioRefreshToken`
- `AuthContext.isLoggedIn`
- `AuthContext.user`
- `AuthContext.accessToken`
- `OpenAuthContext.openLogin`
- `OpenAuthContext.openSignUp`

## API service hien tai

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `POST /auth/refreshtToken`
- `GET /users/my-info`
- `GET /users/search`

## Luu y tich hop

Frontend da dong bo theo backend hien tai. `refreshtToken` van la typo o contract backend; nen doi backend sang endpoint chuan hon trong mot migration rieng neu muon lam dep API.
