# Backend Module: AI

## Muc dich

Ho tro chatbot, AI conversation, course embedding va recommendation theo preference, course tuong tu, beginner topic.

## File chinh

- `controller/AIController.java`
- `service/ai/ChatBotService.java`
- `service/ai/CourseChatAssistant.java`
- `service/ai/CourseEmbeddingService.java`
- `service/ai/CourseRecommendationService.java`
- `service/impl/ai/ChatBotServiceImpl.java`
- `service/impl/ai/CourseEmbeddingServiceImpl.java`
- `service/impl/ai/CourseRecommendationServiceImpl.java`
- `configuration/LangChain4jConfig.java`
- `job/LangChainCourseEmbeddingJob.java`
- `event/LangChainCourseEventListener.java`
- `dto/request/course/CourseEmbeddingDTO.java`
- `dto/request/course/CourseRecommendationDTO.java`

## API

- `POST /api/ai/chat`
- `DELETE /api/ai/chat/memory/{conversationId}`
- `POST /api/ai/recommendations/by-preferences`
- `GET /api/ai/recommendations/similar/{courseId}`
- `GET /api/ai/recommendations/beginners`

## Cau hinh

Trong `application.yml`:

- `app.ai.chatbot.memory-size`
- `app.ai.chatbot.max-results`
- `app.ai.recommendation.top-k`
- `app.ai.recommendation.min-score`
- `langChain4j.embedding-model.model-name`
- `langChain4j.embedding-model.dimensions`

## Luong du lieu

1. Course duoc tao/cap nhat.
2. Event/job tao embedding cho course.
3. Embedding duoc dung cho recommendation hoac matching.
4. Chatbot giu memory theo conversation va tra loi qua MessageResponse.

## Phu thuoc

- Course module de lay noi dung course.
- Interaction module de luu/chat AI conversation.
- PostgreSQL pgvector/LangChain4j/Ollama cho embedding va chat model.
