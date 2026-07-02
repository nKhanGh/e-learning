# Kien truc va luong chay

## Backend architecture

Backend dung layered architecture cua Spring Boot:

```text
controller -> service interface -> service impl -> repository -> database/search/cache
          -> dto/mapper/entity/enums/exception/configuration
```

Thanh phan chinh:

- `controller`: expose REST API va STOMP message mapping.
- `service`: interface theo domain.
- `service/impl`: business logic, authorization check, orchestration giua repository va external service.
- `repository`: Spring Data JPA, Elasticsearch repository, Feign email client.
- `entity`: JPA entity theo domain `user`, `course`, `enrollment`, `interaction`, `payment`, `common`.
- `dto`: request/response contract.
- `mapper`: MapStruct/manual mapper giua entity va DTO.
- `configuration`: security, CORS, JWT decoder, WebSocket, Kafka, Redis/search/AI config.

## Frontend architecture

Frontend dung Next.js App Router:

```text
app/[locale]/page routes
  -> components/layouts, components/domain
  -> contexts
  -> services
  -> lib/apiClient, hooks/queries, utils/WebSocketService
  -> backend /api va /ws
```

Thanh phan chinh:

- `src/app`: route tree theo `/:locale`.
- `src/components`: layout, auth, course, chat, UI primitive.
- `src/contexts`: state dung chung cho auth, modal auth, conversation, websocket.
- `src/services`: wrapper Axios theo domain.
- `src/hooks/queries`: TanStack Query hooks cho server state va client-side cache.
- `src/types`: TypeScript response/request model va enum.
- `src/messages`: localization `en` va `vi`.

## Runtime flow

1. Frontend doc `NEXT_PUBLIC_APP_API_URL` va goi REST API bang Axios.
2. `apiClient` gan access token tu localStorage vao header `Authorization`.
3. Backend xu ly request qua Spring Security/JWT, controller va service domain.
4. Data duoc doc/ghi qua PostgreSQL, Redis, Elasticsearch hoac file storage local.
5. Chat dung SockJS + STOMP toi `/api/ws`, publish len `/app/*`, subscribe `/user/queue/*` va `/topic/*`.

## Data stores va external systems

| He thong | Vai tro |
| --- | --- |
| PostgreSQL/pgvector | Du lieu chinh va vector embedding cho AI/search |
| Redis | Cache, presence online, token/session support |
| Kafka | Event/email pipeline va messaging async |
| Elasticsearch | Course search index |
| Kibana | UI quan sat Elasticsearch local |
| LangChain4j/Ollama | Chatbot, embedding va recommendation |
| File system local | Upload avatar, video, chat file, document trong dev |
