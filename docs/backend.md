# Backend

Backend nam trong `backend`, la Spring Boot API server cho Learnio.

## Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web, Security, OAuth2 Resource Server/Client
- Spring Data JPA, PostgreSQL
- Redis va Redisson
- Kafka
- WebSocket/STOMP
- Elasticsearch
- LangChain4j
- MapStruct, Lombok
- Springdoc OpenAPI
- Maven

## Cau truc source

```text
backend/src/main/java/com/khangdev/elearningbe/
|-- configuration/
|-- controller/
|-- document/
|-- dto/
|-- entity/
|-- enums/
|-- event/
|-- exception/
|-- job/
|-- mapper/
|-- repository/
|-- security/
|-- service/
|-- utils/
`-- ELearningBeApplication.java
```

## Context path

Trong `application.yml`:

- Server port: `8080`
- Context path: `/api`
- Swagger UI: `/api/swagger-ui/index.html#`

## Profiles va config

Resources hien co:

- `application.yml`: config chung.
- `application-local.yml`: profile local.
- `application-prod.yml`: profile production.
- `elasticsearch/course-mapping.json`: mapping index course.

## Module docs

- [Authentication va Security](backend/authentication.md)
- [User va Instructor](backend/user-instructor.md)
- [Course Catalog](backend/course-catalog.md)
- [Learning Content](backend/learning-content.md)
- [Course Publishing](backend/course-publishing.md)
- [Quiz va Assessment](backend/quiz-assessment.md)
- [Enrollment](backend/enrollment.md)
- [Chat va Realtime](backend/chat-realtime.md)
- [AI](backend/ai.md)
- [File, Email va Common Services](backend/file-email-common.md)
- [Report va Moderation](backend/reporting-moderation.md)
- [Search, Cache va Infrastructure](backend/search-cache-infra.md)
