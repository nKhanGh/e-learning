package com.khangdev.elearningbe.configuration;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class LangChain4jConfig {

    @Value("${langChain4j.open-ai.chat-model.api-key}")
    private String openAiApiKey;

    @Value("${langChain4j.open-ai.chat-model.model-name}")
    private String chatModelName;

    @Value("${langChain4j.open-ai.chat-model.temperature}")
    private Double temperature;

    @Value("${langChain4j.embedding-model.model-name}")
    private String embeddingModelName;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Value("${app.ai.chatbot.memory-size:10}")
    private Integer memorySize;

    @Value("${langChain4j.embedding-model.dimensions}")
    private Integer dimensions;


    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return OpenAiChatModel.builder()
                .apiKey(openAiApiKey)
                .modelName(chatModelName)
                .temperature(temperature)
                .timeout(Duration.ofSeconds(60))
                .logRequests(true)
                .logResponses(true)
                .build();
    }

    @Bean
    EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .apiKey(openAiApiKey)
                .modelName(embeddingModelName)
                .timeout(Duration.ofSeconds(60))
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return PgVectorEmbeddingStore.builder()
                .host(extractHost(datasourceUrl))
                .port(extractPort(datasourceUrl))
                .database(extractDatabase(datasourceUrl))
                .user(datasourceUsername)
                .password(datasourcePassword)
                .table("course_embeddings")
                .dimension(dimensions)
                .createTable(true)
                .dropTableFirst(false)
                .build();
    }

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.withMaxMessages(memorySize);
    }


    private String extractHost(String jdbcUrl){
        String[] parts = jdbcUrl.split("//")[1].split(":");
        return parts[0];
    }

    private int extractPort(String jdbcUrl){
        String[] parts = jdbcUrl.split("//")[1].split(":");
        String portAndDb = parts[parts.length-1];
        return Integer.parseInt(portAndDb.split("/")[0]);
    }

    private String extractDatabase(String jdbcUrl){
        String[] parts = jdbcUrl.split("/");
        return parts[parts.length-1];
    }
}
