package com.khangdev.elearningbe.service.impl.course;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSearchResponse;
import com.khangdev.elearningbe.service.course.CourseSearchCacheService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RList;
import org.redisson.api.RMapCache;
import org.redisson.api.RedissonClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseSearchCacheServiceImpl implements CourseSearchCacheService {

    private final RedissonClient redissonClient;
    private final ObjectMapper objectMapper;

    // L1 – Caffeine (per JVM instance, ~2min)
    private Cache<String, CourseSearchResponse.Page> l1;

    // L2 – Redis (shared, key: csk:<md5>)
    private RMapCache<String, String> l2;

    private static final String L2_MAP_KEY      = "course:search:cache";
    private static final String HOT_COURSES_KEY  = "course:hot:courses";
    private static final int    L1_TTL_SEC       = 120;
    private static final int    L2_DEFAULT_TTL   = 180;
    private static final int    L2_BROWSE_TTL    = 600;

    private String normalize(String s) {
        return s == null ? "" : s.trim().toLowerCase();
    }

    private <T> boolean notEmpty(List<T> list) {
        return list != null && !list.isEmpty();
    }

    private boolean isBrowseMode(CourseSearchRequest request){
        return (request.getKeyword() == null || request.getKeyword().isBlank())
                && !notEmpty(request.getCategoryId())
                && request.getLevel() == null
                && request.getMinPrice() == null;
    }

    private String md5(String input){
        try{
            byte[] hash = MessageDigest.getInstance("MD5").digest(input.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }

    @PostConstruct
    void init(){
        l1 = Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(L1_TTL_SEC, TimeUnit.SECONDS)
                .recordStats()
                .build();
        l2 = redissonClient.getMapCache(L2_MAP_KEY);
    }


    @Override
    public Optional<CourseSearchResponse.Page> get(String key) {

        CourseSearchResponse.Page  hit = l1.getIfPresent(key);
        if (hit != null) return  Optional.of(hit);

        try{
            String json = l2.get(key);
            if(json != null){
                CourseSearchResponse.Page page =
                        objectMapper.readValue(json, CourseSearchResponse.Page.class);
                l1.put(key, page);
                return Optional.of(page);
            }
        } catch (JsonProcessingException e) {
            log.warn("Cache L2 read error key={}: {}", key, e.getMessage());
        }

        log.info("No cache ");
        return Optional.empty();
    }

    @Override
    @Async("cacheExecutor")
    public void putAsync(String key, CourseSearchResponse.Page page, CourseSearchRequest req) {
        l1.put(key, page);
        try {
            String json = objectMapper.writeValueAsString(page);
            int ttl = isBrowseMode(req) ? L2_BROWSE_TTL : L2_DEFAULT_TTL;
            l2.put(key, json, ttl, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            log.warn("Cache L2 write error key={}: {}", key, e.getMessage());
        }
    }

    @Override
    public void invalidateAll() {
        l1.invalidateAll();
        l2.clear();
        log.info("Search cache invalidated");
    }

    @Override
    public List<CourseSearchResponse.CourseItem> getHotCourses(int size) {
        log.info("get hot courses size={}", size);
        try {
            RList<String> list = redissonClient.getList(HOT_COURSES_KEY);
            List<String> raw = list.range(0, size - 1);
            List<CourseSearchResponse.CourseItem> result = new ArrayList<>();
            for (String json : raw) {
                result.add(objectMapper.readValue(json, CourseSearchResponse.CourseItem.class));
            }

            return result;
        } catch (JsonProcessingException e) {
            log.error("getHotCourses failed: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String buildKey(CourseSearchRequest req) {

        StringBuilder sb = new StringBuilder();
        sb.append("kw:").append(normalize(req.getKeyword()));
        if (notEmpty(req.getCategoryId())) {
            List<String> sorted = req.getCategoryId().stream()
                    .map(UUID::toString).sorted().toList();
            sb.append("|cat:").append(String.join(",", sorted));
        }
        if (req.getLevel()            != null) sb.append("|lv:").append(req.getLevel());
        if (req.getMinPrice()         != null) sb.append("|pmin:").append(req.getMinPrice());
        if (req.getMaxPrice()         != null) sb.append("|pmax:").append(req.getMaxPrice());
        if (req.getMinAverageRating() != null) sb.append("|rmin:").append(req.getMinAverageRating());
        if (req.getMaxAverageRating() != null) sb.append("|rmax:").append(req.getMaxAverageRating());
        if (Boolean.TRUE.equals(req.getIsFree()))   sb.append("|free");
        if (Boolean.TRUE.equals(req.getHasQuiz()))  sb.append("|quiz");
        if (notEmpty(req.getTagNames())) {
            List<String> sorted = req.getTagNames().stream().sorted().toList();
            sb.append("|tag:").append(String.join(",", sorted));
        }
        sb.append("|p:").append(req.getPage());
        sb.append("|s:").append(req.getSize());
        sb.append("|sort:").append(req.getSortBy());
        return "csk:" + md5(sb.toString());
    }
}
