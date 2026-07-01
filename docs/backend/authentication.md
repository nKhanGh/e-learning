# Backend Module: Authentication va Security

## Muc dich

Module nay xu ly dang ky, dang nhap, dang xuat, refresh token, verify email, forgot/reset password, JWT verification va OAuth2 login.

## File chinh

- `backend/src/main/java/com/khangdev/elearningbe/controller/AuthenticationController.java`
- `backend/src/main/java/com/khangdev/elearningbe/service/user/AuthenticationService.java`
- `backend/src/main/java/com/khangdev/elearningbe/service/impl/user/AuthenticationServiceImpl.java`
- `backend/src/main/java/com/khangdev/elearningbe/service/common/JwtService.java`
- `backend/src/main/java/com/khangdev/elearningbe/service/impl/common/JwtServiceImpl.java`
- `backend/src/main/java/com/khangdev/elearningbe/configuration/SecurityConfig.java`
- `backend/src/main/java/com/khangdev/elearningbe/configuration/CustomJwtDecoder.java`
- `backend/src/main/java/com/khangdev/elearningbe/security/oauth2/*`

## API

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/refreshtToken`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Luong xu ly

1. Client gui credential toi `/auth/login`.
2. Service xac thuc user, tao access token va refresh token bang `JwtService`.
3. Frontend luu token trong localStorage va gui lai qua header `Authorization: Bearer ...`.
4. `CustomJwtDecoder`/Spring Security verify token cho request can auth.
5. Logout/refresh/verify email/forgot password duoc xu ly qua DTO rieng trong `dto/request/authentication`.

## Bien moi truong

- `JWT_SIGNER_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- `APP_FRONTEND_URL`, `APP_BASE_URL`
- `API_KEY_EMAIL`, `EMAIL_SENDER`

## Test lien quan

- `backend/src/test/java/com/khangdev/elearningbe/controller/AuthenticationControllerTest.java`
- `backend/src/test/java/com/khangdev/elearningbe/service/AuthenticationServiceTest.java`
- `backend/src/test/java/com/khangdev/elearningbe/service/JwtServiceTest.java`
