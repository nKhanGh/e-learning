package com.khangdev.elearningbe.configuration;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.Duration;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@EnableScheduling
public class SearchConfig extends ElasticsearchConfiguration {

    @Value("${elasticsearch.uris:localhost:9200}")
    private String esUri;

    @Value("${elasticsearch.username:elastic}")
    private String esUser;

    @Value("${elasticsearch.password:changeme}")
    private String esPass;

    @Override
    public ClientConfiguration clientConfiguration() {
        return ClientConfiguration.builder()
                .connectedTo(esUri)
                .withBasicAuth(esUser, esPass)
                .withSocketTimeout(Duration.ofSeconds(30))
                .withConnectTimeout(Duration.ofSeconds(5))
                .build();
    }

//    @Bean
//    public ElasticsearchMappingContext elasticsearchMappingContext() {
//        ElasticsearchMappingContext context = new ElasticsearchMappingContext();
//        context.setWriteTypeHints(false); // 🔥 QUAN TRỌNG NHẤT
//        return context;
//    }

    // L1 Caffeine CacheManager
    @Bean
    public CacheManager caffeineCacheManager(){
        CaffeineCacheManager mgr = new CaffeineCacheManager();
        mgr.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(2))
                .recordStats()
        );

        return mgr;
    }

    // Async executor dùng cho cache write
    @Bean("cacheExecutor")
    public Executor cacheExecutor(){
        ThreadPoolTaskExecutor ex = new  ThreadPoolTaskExecutor();
        ex.setCorePoolSize(4);
        ex.setMaxPoolSize(8);
        ex.setQueueCapacity(200);
        ex.setThreadNamePrefix("cache-");
        ex.setRejectedExecutionHandler( new ThreadPoolExecutor.CallerRunsPolicy());
        ex.initialize();
        return ex;
    }
}
