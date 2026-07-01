# Backend Module: Search, Cache va Infrastructure

## Muc dich

Gom cac phan ha tang khong nam trong mot feature don le: Elasticsearch, Redis cache, Kafka, resilience, observability, Docker Compose va scheduled/background jobs.

## Search

File chinh:

- `configuration/SearchConfig.java`
- `document/CourseDocument.java`
- `repository/CourseSearchRepository.java`
- `service/course/CourseSearchService.java`
- `service/course/CourseIndex.java`
- `service/course/CourseSearchCacheService.java`
- `resources/elasticsearch/course-mapping.json`

Vai tro:

- Luu document course vao Elasticsearch.
- Search/filter/sort/pagination course.
- Reindex course khi can.

## Cache va Redis

File chinh:

- `service/common/RedisService.java`
- `service/course/CourseSearchCacheService.java`
- `configuration/WebSocketEventListener.java`

Vai tro:

- Cache search result.
- WebSocket presence.
- Session/token helper.

## Kafka

File chinh:

- `configuration/KafkaConfig.java`
- `event/LangChainCourseEventListener.java`

Vai tro:

- Xu ly event async, email pipeline va AI embedding/recommendation events.

## Jobs

- `job/ResetUserStatusJob.java`: reset user status/background maintenance.
- `job/LangChainCourseEmbeddingJob.java`: tao/cap nhat embedding cho course.

## Docker Compose local

`backend/docker-compose.yml` khai bao:

- PostgreSQL pgvector port host `5433`
- Redis port `6379`
- Kafka ports `9092`, `9094`
- Elasticsearch port `9200`
- Kibana port `5601`

## Observability va resilience

Pom co:

- Spring Boot Actuator
- Micrometer Prometheus registry
- OpenTelemetry Zipkin exporter
- Resilience4j circuit breaker/rate limiter
