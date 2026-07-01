# Backend Module: File, Email va Common Services

## Muc dich

Tap hop cac service dung chung: file upload/protected access, email, JWT, Redis helper va DTO response chung.

## File service

File chinh:

- `controller/FileController.java`
- `service/common/FileService.java`
- `service/impl/common/FileServiceImpl.java`
- `dto/response/common/SignedUrlResponse.java`

API:

- `GET /api/files/avatars/{fileName}`
- `GET /api/files/protected/{fileName}`
- `GET /api/files/signed-url`

Chuc nang:

- Upload avatar/video/document/chat file.
- Tao va verify signed URL cho protected video/file.
- Check quyen xem lecture.
- Load/delete local file.

## Email service

File chinh:

- `service/common/EmailService.java`
- `service/impl/common/EmailServiceImpl.java`
- `repository/httpClient/EmailClient.java`
- `dto/request/email/*`
- `dto/response/email/EmailResponse.java`

Chuc nang:

- Gui email chung.
- Gui OTP verify email.
- Gui email doi/reset mat khau.
- Verify email OTP.

## JWT va Redis

- `service/common/JwtService.java`
- `service/impl/common/JwtServiceImpl.java`
- `service/common/RedisService.java`
- `service/impl/common/RedisServiceImpl.java`

JWT dung cho access/refresh token. Redis dung cho cache, token/session support va WebSocket presence.

## Config file storage

Trong `application.yml`:

- `file.uploadDir`
- `file.avatarDir`
- `file.videoDir`
- `file.chatDir`
- `file.documentDir`
- `file.videoTokenSecret`
- `file.videoTokenExpiration`

## Test lien quan

- `controller/FileControllerTest.java`
- `service/FileServiceTest.java`
- `service/EmailServiceTest.java`
- `service/JwtServiceTest.java`
- `service/RedisServiceTest.java`
