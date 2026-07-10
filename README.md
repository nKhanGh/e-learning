# Learnio

Learnio is an e-learning platform consisting of two main applications:

* `backend`: A Spring Boot API responsible for authentication, course management, lectures, quizzes, enrollment, real-time chat, AI recommendation, files, and email.
* `frontend`: A Next.js App Router UI responsible for the learner experience, course search, course details, real-time chat, theme, and language support.

Detailed documentation is organized in the [docs](docs/README.md) directory.

## Main Technologies

| Part                       | Technologies                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend                    | Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, PostgreSQL, Redis, Kafka, Elasticsearch, WebSocket/STOMP, LangChain4j, Maven |
| Frontend                   | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, next-intl, TanStack Query, Axios, SockJS/STOMP, Radix UI, lucide-react, Font Awesome   |
| Development Infrastructure | Docker Compose, PostgreSQL pgvector, Redis, Kafka, Elasticsearch, Kibana                                                                   |

## Repository Structure

```text
e-learning/
|-- backend/       # Spring Boot REST API and real-time gateway
|-- frontend/      # Next.js web client
|-- docs/          # General documentation and module-specific documentation
`-- README.md      # Main README for the monorepo
```

## Running Locally

### Backend

```bash
cd backend
docker-compose up -d
mvn spring-boot:run
```

By default, the backend runs at `http://localhost:8080/api`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend runs at `http://localhost:3000`.

## Important Environment Variables

The backend reads environment variables from `.env` or the Spring profile configuration:

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

The frontend requires the following public environment variables:

```env
NEXT_PUBLIC_APP_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_API_URL=http://localhost:8080/api/ws
NEXT_PUBLIC_AVATAR_BASE_URL=http://localhost:8080/api/files/avatars/
```

## Module Overview

The backend includes the following module groups:

- Authentication va security: login, register, JWT, refresh token, OAuth2, email verify, forgot/reset password.
- User va instructor: profile, avatar, search user, dang ky instructor.
- Course catalog: course, category, section, tag, search Elasticsearch, cache.
- Learning content: lecture, public lecture, progress, bookmark, note.
- Course publishing: publish checklist, submit review, course status lifecycle cho instructor.
- Assessment: quiz, question, attempt, answer, submission.
- Enrollment: ghi danh, truy van enrollment, access/completion.
- Interaction va realtime: conversation, participant, message, reaction, STOMP WebSocket, online status.
- AI: chatbot, course embedding, course recommendation.
- Common services: file, email, JWT, Redis.
- Report/moderation: tao report, search report, xu ly report.

The frontend includes the following module groups:

- Routing/pages: home, courses, course detail, chat, settings theo route `/:locale`.
- Instructor course studio: my courses, create/edit course, sections, lectures, quiz, resources, preview, publish checklist.
- API services: auth, user, course, category, enrollment, conversation, participant, message, AI.
- Context/state: auth, auth modal, websocket, conversation.
- UI/components: layout, auth form, course cards/sidebar, chat panels, pagination/loading/toast.
- Utilities: shared API client, TanStack Query hooks, WebSocket singleton, auth helper, time formatter.
- i18n/theme: `en`, `vi`, route locale, dark/light theme trong localStorage.

## API and Development Documentation

- Swagger UI: `http://localhost:8080/api/swagger-ui/index.html#`
- Backend docs: [docs/backend.md](docs/backend.md)
- Frontend docs: [docs/frontend.md](docs/frontend.md)
- API endpoint map: [docs/backend/api-endpoints.md](docs/backend/api-endpoints.md)
- Luu y tich hop FE/BE: [docs/integration-notes.md](docs/integration-notes.md)
- Instructor Studio docs: [docs/frontend/instructor-course-studio.md](docs/frontend/instructor-course-studio.md)
- Course Publishing docs: [docs/backend/course-publishing.md](docs/backend/course-publishing.md)

## Useful Commands

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

## Original README Sources

This README was compiled from:

* [backend/README.md](backend/README.md)
* [frontend/README.md](frontend/README.md)

```
```
