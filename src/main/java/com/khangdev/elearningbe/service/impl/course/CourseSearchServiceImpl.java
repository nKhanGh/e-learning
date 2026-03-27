package com.khangdev.elearningbe.service.impl.course;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.Aggregation;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.json.JsonData;
import com.khangdev.elearningbe.document.CourseDocument;
import com.khangdev.elearningbe.dto.request.course.CourseSearchRequest;
import com.khangdev.elearningbe.dto.response.course.CourseSearchResponse;
import com.khangdev.elearningbe.enums.CourseSortOption;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.service.course.CourseSearchCacheService;
import com.khangdev.elearningbe.service.course.CourseSearchService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregation;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchAggregations;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightFieldParameters;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CourseSearchServiceImpl implements CourseSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final CourseSearchCacheService cacheService;

    @Override
    @CircuitBreaker(name = "elasticsearch", fallbackMethod = "searchFallback")
    public CourseSearchResponse.Page search(CourseSearchRequest req) {
        long start = System.currentTimeMillis();

        String cacheKey = cacheService.buildKey(req);
        Optional<CourseSearchResponse.Page> cached = cacheService.get(cacheKey);
        if (cached.isPresent()) {
            return withCacheMeta(cached.get(), System.currentTimeMillis() - start);
        }

        NativeQuery query = buildNativeQuery(req);
        SearchHits<CourseDocument> hits = elasticsearchOperations.search(query, CourseDocument.class);

        CourseSearchResponse.Page page = mapPage(hits, req, cacheKey, start);
        cacheService.putAsync(cacheKey, page, req);

        if (page.getMeta().getTotalElements() > 0) {
            cacheService.putAsync(cacheKey, page, req);
        }

        return page;
    }

    @Override
    public CourseSearchResponse.Page searchFallback(CourseSearchRequest req, Throwable t) {
        log.error("ES circuit breaker open, fallback to Redis hot courses. Cause: {}", t.getMessage());
        List<CourseSearchResponse.CourseItem> hotCourses = cacheService.getHotCourses(req.getSize());
        return CourseSearchResponse.Page.builder()
                .courses(hotCourses)
                .meta(CourseSearchResponse.PageMeta.builder()
                        .page(0).size(hotCourses.size())
                        .totalElements(hotCourses.size())
                        .totalPages(1).hasNext(false).hasPrevious(false)
                        .build())
                .searchInfo(CourseSearchResponse.SearchInfo.builder()
                        .fromCache(true).tookMs(0).build())
                .build();
    }

    private NativeQuery buildNativeQuery(CourseSearchRequest req) {
        Query mainQuery = buildMainQuery(req);
        Query filtered = wrapWithFilter(mainQuery, req);
        Query finalQuery = wrapFunctionScore(filtered, req);

        return NativeQuery.builder()
                .withQuery(finalQuery)
                .withSort(buildSort(req))
                .withPageable(PageRequest.of(req.getPage(), req.getSize()))
                .withHighlightQuery(buildHighLight())
                .withAggregation("by_category",  aggTerms("category_id",    20))
                .withAggregation("by_level",      aggTerms("level",          10))
                .withAggregation("by_tag",        aggTerms("tag_names",      30))
                .withAggregation("price_stats",   aggStats("price"))
                .build();
    }


    /**
     * Nếu có keyword: bool{should[multiMatch, phraseMatch]}
     * Nếu không:      match_all (browse mode)
     *
     * Field boosting:
     *   title^4     – quan trọng nhất
     *   title_keyword^3 (exact) – nếu gõ đúng title
     *   description^1.5
     *   instructor_name^1
     *   tag_names^2
     */
    private Query buildMainQuery(CourseSearchRequest req) {
        if (req.getKeyword() == null || req.getKeyword().isBlank()) {
            return Query.of(q -> q.matchAll(m -> m));
        }

        String kw = req.getKeyword().trim();

        return Query.of(q -> q.bool(b -> b
                .should(s -> s.multiMatch(mm -> mm
                        .query(kw)
                        .fields(
                                "title^4",
                                "description^1.5",
                                "instructor_name^1",
                                "tag_names^2"
                        )
                        .type(TextQueryType.BestFields)
                        .tieBreaker(0.3)
                        .fuzziness("AUTO")
                        .prefixLength(2)
                        .operator(Operator.Or)
                        .minimumShouldMatch("60%")
                ))
                .should(s -> s.matchPhrase(mp -> mp
                        .field("title")
                        .query(kw)
                        .boost(6.0f)
                ))
                .minimumShouldMatch("1")
        ));
    }


    /**
     * Tất cả điều kiện lọc từ CourseSearchRequest được đặt trong filter context:
     * - Luôn filter status = PUBLISHED
     * - categoryId (IN list UUID)
     * - level (enum)
     * - price range
     * - averageRating range
     * - isFree
     * - hasQuiz  (ánh xạ sang has_quizzes trong document)
     * - tagNames (terms query – course phải có ÍT NHẤT 1 tag khớp)
     */
    private Query wrapWithFilter(Query mainQuery, CourseSearchRequest req) {
        List<Query> filters = new ArrayList<>();
        filters.add(termFilter("status", CourseStatus.PUBLISHED.name()));

        if (notEmpty(req.getCategoryId())) {
            List<FieldValue> vals = req.getCategoryId()
                    .stream().map(uuid -> FieldValue.of(uuid.toString()))
                    .toList();
            filters.add(Query.of(q -> q.terms(t -> t
                    .field("category_id")
                    .terms(tv -> tv.value(vals))
            )));
        }

        if (req.getLevel() != null) {
            filters.add(termFilter("level", req.getLevel().name()));
        }

        if (req.getMinPrice() != null || req.getMaxPrice() != null) {
            filters.add(Query.of(q -> q.range( r -> {
                r.field("price");
                if (req.getMinPrice() != null ) r.gte(JsonData.of(req.getMinPrice()));
                if (req.getMaxPrice() != null ) r.lte(JsonData.of(req.getMaxPrice()));
                return r;
            })));
        }

        if (req.getMinAverageRating() != null || req.getMaxAverageRating() != null) {
            filters.add(Query.of(q -> q.range(r -> {
                r.field("average_rating");
                if (req.getMinAverageRating() != null ) r.gte(JsonData.of(req.getMinAverageRating()));
                if (req.getMaxAverageRating() != null ) r.lte(JsonData.of(req.getMaxAverageRating()));
                return r;
            })));
        }

        if (Boolean.TRUE.equals(req.getHasQuiz())) {
            filters.add(termFilter("has_quizzes", "true"));
        }

        if (Boolean.TRUE.equals(req.getIsFree())) {
            filters.add(termFilter("is_free", "true"));
        }

        if (notEmpty(req.getTagNames())) {
            List<FieldValue> tagVals = req.getTagNames().stream()
                    .map(FieldValue::of)
                    .toList();
            filters.add(Query.of(q -> q.terms(t -> t
                    .field("tag_names")
                    .terms(tv -> tv.value(tagVals))
            )));
        }

        if (filters.size() == 1) return mainQuery;

        return Query.of(q -> q.bool(b -> b
                .must(mainQuery)
                .filter(filters)
        ));
    }


    /**
     * Chỉ áp dụng khi sort = RELEVANCE.
     *
     * Ba function kết hợp scoreMode=Sum, rồi nhân vào BM25 score gốc (Multiply):
     *
     *   finalScore = bm25 × (
     *       log1p(popularity_score) × 0.1     ← enrollment/review signal
     *     + 1.3 nếu average_rating ≥ 4.5      ← quality signal
     *     + gauss(published_at, scale=90d)     ← freshness decay
     *   )
     *
     * maxBoost=3.0 để khóa học hot không ăn quá nhiều điểm.
     */
    private Query wrapFunctionScore(Query baseQuery, CourseSearchRequest req){
        if (req.getSortBy() != CourseSortOption.RELEVANCE){
            return baseQuery;
        }

        return Query.of(q -> q.functionScore(fs -> fs
                .query(baseQuery)
                .functions(
                        FunctionScore.of(f -> f
                                .fieldValueFactor(fvf -> fvf
                                        .field("popularity_score")
                                        .factor(0.1)
                                        .modifier(FieldValueFactorModifier.Log1p)
                                        .missing(0.0)
                                )
                        ),
                        FunctionScore.of(f -> f
                                .filter(Query.of(fq -> fq.range(r -> r
                                        .field("average_rating")
                                        .gte(JsonData.of(req.getMinAverageRating() != null ? req.getMinAverageRating(): 4.5))
                                )))
                                .weight(1.3)
                        ),
                        FunctionScore.of(f -> f
                                .gauss(g -> g
                                        .field("published_at")
                                        .placement(p -> p
                                                .origin(JsonData.of("now"))
                                                .scale(JsonData.of("90d"))
                                                .offset(JsonData.of("7d"))
                                                .decay(0.5))
                                )
                        )
                )
                .boostMode(FunctionBoostMode.Multiply)
                .scoreMode(FunctionScoreMode.Sum)
                .maxBoost(3.0)
        ));
    }

    // 4. Sort
    private List<SortOptions> buildSort(CourseSearchRequest req){
        return switch(req.getSortBy()){
            case RATING     -> List.of(fieldSort("average_rating",    SortOrder.Desc));
            case NEWEST     -> List.of(fieldSort("published_at",      SortOrder.Desc));
            case POPULARITY -> List.of(fieldSort("total_enrollments", SortOrder.Desc));
            case PRICE_ASC  -> List.of(fieldSort("price",             SortOrder.Asc));
            case PRICE_DESC -> List.of(fieldSort("price",             SortOrder.Desc));
            default         -> List.of(SortOptions.of(s -> s.score(sc -> sc.order(SortOrder.Desc))));
        };
    }


    private SortOptions fieldSort(String field, SortOrder order){
        return SortOptions.of(s -> s.field(f -> f.field(field).order(order)));
    }

    // 5. Highlight
    /**
     * Trả về fragment của title và description với tag <em> bao quanh từ khóa.
     * numberOfFragments=3 → lấy tối đa 3 đoạn văn, mỗi đoạn 150 ký tự.
     */
    private HighlightQuery buildHighLight() {
        HighlightFieldParameters params = HighlightFieldParameters.builder()
                .withNumberOfFragments(3)
                .withFragmentSize(150)
                .withPreTags("<em>")
                .withPostTags("</em>")
                .build();

        return new HighlightQuery(
                new Highlight(List.of(
                        new HighlightField("title", params),
                        new HighlightField("description", params)
                )),
                CourseDocument.class
        );
    }

    // 6. Aggregations
    private Aggregation aggTerms(String field, int size) {
        return Aggregation.of(a -> a.terms(t -> t.field(field).size(size)));
    }

    private Aggregation aggStats(String field) {
        return Aggregation.of(a -> a.stats(s -> s.field(field)));
    }



    private Query termFilter(String field, String value){
        return Query.of(q -> q.term(t -> t.field(field).value(value)));
    }

    private <T> boolean notEmpty(List<T> list) {
        return list != null && !list.isEmpty();
    }

    private CourseSearchResponse.Page withCacheMeta(CourseSearchResponse.Page page, long tookMs){
        CourseSearchResponse.SearchInfo updated = CourseSearchResponse.SearchInfo.builder()
                .fromCache(true)
                .tookMs(tookMs)
                .traceId(page.getSearchInfo().getTraceId())
                .build();
        page.setSearchInfo(updated);
        return page;
    }

    private CourseSearchResponse.Page mapPage(
            SearchHits<CourseDocument> hits,
            CourseSearchRequest req,
            String cacheKey,
            long start) {

        List<CourseSearchResponse.CourseItem> items = hits.getSearchHits().stream()
                .map(this::toItem)
                .collect(Collectors.toList());

        long total      = hits.getTotalHits();
        int  totalPages = (int) Math.ceil((double) total / req.getSize());

        return CourseSearchResponse.Page.builder()
                .courses(items)
                .meta(CourseSearchResponse.PageMeta.builder()
                        .page(req.getPage())
                        .size(req.getSize())
                        .totalElements(total)
                        .totalPages(totalPages)
                        .hasNext(req.getPage() < totalPages - 1)
                        .hasPrevious(req.getPage() > 0)
                        .build())
                .facets(extractFacets(hits))
                .searchInfo(CourseSearchResponse.SearchInfo.builder()
                        .tookMs(System.currentTimeMillis() - start)
                        .fromCache(false)
                        .traceId(cacheKey)
                        .build())
                .build();
    }

    private CourseSearchResponse.CourseItem toItem(SearchHit<CourseDocument> hit) {
        CourseDocument doc = hit.getContent();
        return CourseSearchResponse.CourseItem.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .slug(doc.getSlug())
                .description(doc.getDescription())
                .thumbnailUrl(doc.getThumbnailUrl())
                .categoryId(doc.getCategoryId())
                .categoryName(doc.getCategoryName())
                .level(doc.getLevel())
                .language(doc.getLanguage())
                .price(doc.getPrice())
                .originalPrice(doc.getOriginalPrice())
                .isFree(doc.getIsFree())
                .hasQuizzes(doc.getHasQuizzes())
                .hasCertificate(doc.getHasCertificate())
                .isFeatured(doc.getIsFeatured())
                .isBestseller(doc.getIsBestseller())
                .averageRating(doc.getAverageRating())
                .totalReviews(doc.getTotalReviews())
                .totalEnrollments(doc.getTotalEnrollments())
                .durationMinutes(doc.getDurationMinutes())
                .totalLectures(doc.getTotalLectures())
                .instructorId(doc.getInstructorId())
                .instructorName(doc.getInstructorName())
                .tagNames(doc.getTagNames())
                .searchScore(hit.getScore())
                .highlights(hit.getHighlightFields())
                .build();
    }

    private CourseSearchResponse.Facets extractFacets(SearchHits<CourseDocument> hits) {
        if (hits.getAggregations() == null) {
            return CourseSearchResponse.Facets.builder().build();
        }

        try {
            List<CourseSearchResponse.Bucket> categories = extractTermBuckets(hits, "by_category");
            List<CourseSearchResponse.Bucket> levels     = extractTermBuckets(hits, "by_level");
            List<CourseSearchResponse.Bucket> tags       = extractTermBuckets(hits, "by_tag");
            CourseSearchResponse.PriceStats priceStats = extractPriceStats(hits, "price_stats");

            return CourseSearchResponse.Facets.builder()
                    .categories(categories)
                    .levels(levels)
                    .tagNames(tags)
                    .priceStats(priceStats)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to extract facets: {}", e.getMessage());
            return CourseSearchResponse.Facets.builder().build();
        }
    }

    private List<CourseSearchResponse.Bucket> extractTermBuckets(
            SearchHits<CourseDocument> hits, String aggName) {

        if (hits.getAggregations() == null) return List.of();

        // Spring Data ES 5.x trả về ElasticsearchAggregations
        ElasticsearchAggregations aggregations =
                (ElasticsearchAggregations) hits.getAggregations();

        ElasticsearchAggregation agg = aggregations.get(aggName);
        if (agg == null) return List.of();

        try {
            return agg.aggregation().getAggregate().sterms()
                    .buckets().array().stream()
                    .map(b -> CourseSearchResponse.Bucket.builder()
                            .key(b.key().stringValue())
                            .docCount(b.docCount())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("extractTermBuckets failed for '{}': {}", aggName, e.getMessage());
            return List.of();
        }
    }

    private CourseSearchResponse.PriceStats extractPriceStats(
            SearchHits<CourseDocument> hits, String aggName) {

        if (hits.getAggregations() == null) return CourseSearchResponse.PriceStats.builder().build();

        ElasticsearchAggregations aggregations =
                (ElasticsearchAggregations) hits.getAggregations();

        ElasticsearchAggregation agg = aggregations.get(aggName);
        if (agg == null) return CourseSearchResponse.PriceStats.builder().build();

        try {
            var stats = agg.aggregation().getAggregate().stats();
            return CourseSearchResponse.PriceStats.builder()
                    .min(stats.min())
                    .max(stats.max())
                    .avg(stats.avg())
                    .build();
        } catch (Exception e) {
            log.warn("extractPriceStats failed for '{}': {}", aggName, e.getMessage());
            return CourseSearchResponse.PriceStats.builder().build();
        }
    }
}
