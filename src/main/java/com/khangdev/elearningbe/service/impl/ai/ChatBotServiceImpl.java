package com.khangdev.elearningbe.service.impl.ai;

import com.khangdev.elearningbe.dto.request.course.CourseRecommendationDTO;
import com.khangdev.elearningbe.dto.request.interaction.AIChatRequest;
import com.khangdev.elearningbe.dto.request.interaction.AIChatResponse;
import com.khangdev.elearningbe.entity.interaction.Conversation;
import com.khangdev.elearningbe.entity.interaction.Message;
import com.khangdev.elearningbe.entity.user.User;
import com.khangdev.elearningbe.enums.MessageSenderType;
import com.khangdev.elearningbe.exception.AppException;
import com.khangdev.elearningbe.exception.ErrorCode;
import com.khangdev.elearningbe.repository.ConversationRepository;
import com.khangdev.elearningbe.repository.MessageRepository;
import com.khangdev.elearningbe.repository.UserRepository;
import com.khangdev.elearningbe.service.ai.ChatBotService;
import com.khangdev.elearningbe.service.ai.CourseChatAssistant;
import com.khangdev.elearningbe.service.ai.CourseEmbeddingService;
import com.khangdev.elearningbe.service.ai.CourseRecommendationService;
import com.khangdev.elearningbe.service.user.UserService;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatBotServiceImpl implements ChatBotService {

    private final ChatLanguageModel chatLanguageModel;

    private final CourseEmbeddingService embeddingService;
    private final CourseRecommendationService recommendationService;
    private final UserService userService;


    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Value("${app.ai.chatbot.memory-size}")
    private Integer memorySize;

    @Value("${app.ai.recommendation.min-score}")
    private Double minScore;

    @Value("${app.ai.recommendation.top-k}")
    private Integer topK;

    private final ConcurrentHashMap<String, CourseChatAssistant> assistantsCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ChatMemory> memoryStore = new ConcurrentHashMap<>();


    @Override
    public AIChatResponse chat(AIChatRequest request) {
        try{
            String conversationId = request.getConversationId().toString();

            Message userMessage = saveUserMessage(request);

            boolean isCourseQuery = isCourseRelatedQuery(request.getMessage());

            String aiReply;
            List<EmbeddingMatch<TextSegment>> relevantCourses = null;

            if (isCourseQuery) {
                relevantCourses = embeddingService.searchSimilarCourses(
                        request.getMessage(),
                        topK,
                        minScore
                );

                String courseContext = embeddingService.buildCourseContext(relevantCourses);

                CourseChatAssistant assistant = getOrCreateAssistant(conversationId);
                aiReply = assistant.chatWithContext(conversationId, request.getMessage(), courseContext);
            } else {
                CourseChatAssistant assistant = getOrCreateAssistant(conversationId);
                aiReply = assistant.chat(conversationId, request.getMessage());
            }

            Message aiMessage = saveAIMessage(request.getConversationId(), aiReply);

            List<CourseRecommendationDTO> suggestions = extractCourseSuggestions(relevantCourses);

            return AIChatResponse.builder()
                    .reply(aiReply)
                    .messageId(aiMessage.getId())
                    .suggestedCourses(suggestions)
                    .build();
        } catch (Exception e) {
            log.error("Error in chat: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_WHEN_CHAT_AI);
        }
    }

    private ChatMemory getMemory(Object conversationId) {
        return memoryStore.computeIfAbsent(
                conversationId.toString(),
                id -> MessageWindowChatMemory.withMaxMessages(memorySize)
        );
    }


    private CourseChatAssistant getOrCreateAssistant(String conversationId) {
        return assistantsCache.computeIfAbsent(conversationId, id ->
                AiServices.builder(CourseChatAssistant.class)
                        .chatLanguageModel(chatLanguageModel)
                        .chatMemoryProvider(this::getMemory)
                        .build()
        );

    }


    private boolean isCourseRelatedQuery(String query) {
        String lowerQuery = query.toLowerCase();
        return lowerQuery.contains("khóa học")
                || lowerQuery.contains("học")
                || lowerQuery.contains("course")
                || lowerQuery.contains("muốn học")
                || lowerQuery.contains("gợi ý")
                || lowerQuery.contains("recommend")
                || lowerQuery.contains("tìm")
                || lowerQuery.contains("tư vấn");
    }

    private Message saveUserMessage(AIChatRequest request){
        UUID userId = userService.getMyInfo().getId();
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getMessage())
                .build();
        return messageRepository.save(message);
    }

    private Message saveAIMessage(UUID conversationId, String content){
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        Message message = Message.builder()
                .senderType(MessageSenderType.AI)
                .sender(null)
                .content(content)
                .conversation(conversation)
                .build();
        return messageRepository.save(message);
    }

    private List<CourseRecommendationDTO> extractCourseSuggestions(
            List<EmbeddingMatch<TextSegment>> matches
    ) {
        if (matches == null || matches.isEmpty()) {
            return List.of();
        }

        return matches.stream()
                .map(match -> {
                    String courseIdStr = match.embedded().metadata().getString("courseId");
                    return recommendationService.getCourseRecommendation(
                            UUID.fromString(courseIdStr),
                            match.score()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }



    @Override
    public void clearConversationMemory(UUID conversationId) {
        assistantsCache.remove(conversationId.toString());
        memoryStore.remove(conversationId.toString());
    }

}
