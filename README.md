# Learnio

Learnio la nen tang e-learning gom hai ung dung chinh:

- `backend`: Spring Boot API phu trach xac thuc, quan ly khoa hoc, bai giang, quiz, enrollment, chat realtime, AI recommendation, file va email.
- `frontend`: Next.js App Router UI phu trach trai nghiem nguoi hoc, tim kiem khoa hoc, chi tiet khoa hoc, chat realtime, theme va ngon ngu.

Tai lieu chi tiet da duoc gom vao thu muc [docs](docs/README.md).

## Cong nghe chinh

| Phan | Cong nghe |
| --- | --- |
| Backend | Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, PostgreSQL, Redis, Kafka, Elasticsearch, WebSocket/STOMP, LangChain4j, Maven |
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, next-intl, TanStack Query, Axios, SockJS/STOMP, Radix UI, lucide-react, Font Awesome |
| Ha tang dev | Docker Compose, PostgreSQL pgvector, Redis, Kafka, Elasticsearch, Kibana |

## Cau truc repo

```text
e-learning/
|-- backend/       # Spring Boot REST API va realtime gateway
|-- frontend/      # Next.js web client
|-- docs/          # Tai lieu tong hop va tai lieu tung module
`-- README.md      # README chung cua monorepo
```

## Chay local

### Backend

```bash
cd backend
docker-compose up -d
mvn spring-boot:run
```

Backend mac dinh chay tai `http://localhost:8080/api`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay tai `http://localhost:3000`.

## Bien moi truong can luu y

Backend doc bien moi truong tu `.env`/profile Spring:

```env
JWT_SIGNER_KEY=
VIDEO_TOKEN_SECRET=
API_KEY_EMAIL=
EMAIL_SENDER=
APP_FRONTEND_URL=
APP_BASE_URL=
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
SPRING_KAFKA_BOOTSTRAP_SERVERS=
REDIS_PASSWORD=
```

Frontend can cac bien public:

```env
NEXT_PUBLIC_APP_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_API_URL=http://localhost:8080/api/ws
NEXT_PUBLIC_AVATAR_BASE_URL=http://localhost:8080/api/files/avatars/
```

## Module tong quan

Backend gom cac nhom module:

- Authentication va security: login, register, JWT, refresh token, OAuth2, email verify, forgot/reset password.
- User va instructor: profile, avatar, search user, dang ky instructor.
- Course catalog: course, category, section, tag, search Elasticsearch, cache.
- Learning content: lecture, public lecture, progress, bookmark, note.
- Assessment: quiz, question, attempt, answer, submission.
- Enrollment: ghi danh, truy van enrollment, access/completion.
- Interaction va realtime: conversation, participant, message, reaction, STOMP WebSocket, online status.
- AI: chatbot, course embedding, course recommendation.
- Common services: file, email, JWT, Redis.
- Report/moderation: tao report, search report, xu ly report.

Frontend gom cac nhom module:

- Routing/pages: home, courses, course detail, chat, settings theo route `/:locale`.
- API services: auth, user, course, category, enrollment, conversation, participant, message, AI.
- Context/state: auth, auth modal, websocket, conversation.
- UI/components: layout, auth form, course cards/sidebar, chat panels, pagination/loading/toast.
- Utilities: shared API client, TanStack Query hooks, WebSocket singleton, auth helper, time formatter.
- i18n/theme: `en`, `vi`, route locale, dark/light theme trong localStorage.

## API va tai lieu phat trien

- Swagger UI: `http://localhost:8080/api/swagger-ui/index.html#`
- Backend docs: [docs/backend.md](docs/backend.md)
- Frontend docs: [docs/frontend.md](docs/frontend.md)
- API endpoint map: [docs/backend/api-endpoints.md](docs/backend/api-endpoints.md)
- Luu y tich hop FE/BE: [docs/integration-notes.md](docs/integration-notes.md)

## Lenh huu ich

```bash
# Backend
cd backend
mvn test
mvn clean install
docker-compose logs -f
docker-compose down

# Frontend
cd frontend
npm run lint
npm run build
npm run start
```

## Nguon README goc

README nay duoc tong hop tu:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
