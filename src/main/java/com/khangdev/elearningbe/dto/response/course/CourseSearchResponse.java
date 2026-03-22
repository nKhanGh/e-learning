package com.khangdev.elearningbe.dto.response.course;

import com.khangdev.elearningbe.enums.CourseLevel;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class CourseSearchResponse {
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Page {
        private List<CourseItem> courses;
        private PageMeta meta;
        private Facets facets;         // Aggregation buckets cho filter UI
        private SearchInfo searchInfo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CourseItem {
        private String id;
        private String title;
        private String slug;
        private String description;
        private String thumbnailUrl;
        private String categoryId;
        private String categoryName;
        private CourseLevel level;
        private String language;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Boolean isFree;
        private Boolean hasQuizzes;
        private Boolean hasCertificate;
        private Boolean isFeatured;
        private Boolean isBestseller;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Integer totalEnrollments;
        private Integer durationMinutes;
        private Integer totalLectures;
        private String instructorId;
        private String instructorName;
        private List<String> tagNames;
        private Float searchScore;
        /** ES highlight snippets: field name → danh sách fragment */
        private Map<String, List<String>> highlights;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PageMeta {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    /** Dùng để render filter sidebar (số lượng kết quả mỗi bucket) */
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Facets {
        private List<Bucket> categories;
        private List<Bucket> levels;
        private List<Bucket> tagNames;
        private PriceStats priceStats;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Bucket {
        private String key;
        private long docCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PriceStats {
        private double min;
        private double max;
        private double avg;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SearchInfo {
        private long tookMs;
        private boolean fromCache;
        private String spellSuggestion;  // "Ý bạn muốn tìm: ..."
        private String traceId;
    }
}
