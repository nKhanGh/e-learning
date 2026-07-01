package com.khangdev.elearningbe.document;

import com.khangdev.elearningbe.enums.CourseLevel;
import com.khangdev.elearningbe.enums.CourseStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Document(indexName = "courses", createIndex = false)
@Setting(settingPath = "elasticsearch/course-settings.json")
@Mapping(mappingPath  = "elasticsearch/course-mapping.json")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDocument {

    // Identity
    @Id
    private String id;                      // UUID dạng String

    // Full-text searchable fields
    @Field(type = FieldType.Text,
            analyzer = "vi_analyzer",
            searchAnalyzer = "vi_search_analyzer",
            name = "title")
    private String title;

    @Field(type = FieldType.Text,
            analyzer = "vi_analyzer",
            searchAnalyzer = "vi_search_analyzer",
            name = "description")
    private String description;

    /** Keyword variant của title — dùng cho sort chính xác */
    @Field(type = FieldType.Keyword, name = "title_keyword")
    private String titleKeyword;

    // Filter / Facet fields (keyword / numeric)
    @Field(type = FieldType.Keyword, name = "category_id")
    private String categoryId;

    @Field(type = FieldType.Keyword, name = "category_name")
    private String categoryName;

    @Field(type = FieldType.Keyword, name = "level")
    private CourseLevel level;

    @Field(type = FieldType.Keyword, name = "language")
    private String language;

    @Field(type = FieldType.Keyword, name = "status")
    private CourseStatus status;

    @Field(type = FieldType.Boolean, name = "is_free")
    private Boolean isFree;

    @Field(type = FieldType.Boolean, name = "has_quizzes")
    private Boolean hasQuizzes;

    @Field(type = FieldType.Boolean, name = "has_certificate")
    private Boolean hasCertificate;

    @Field(type = FieldType.Boolean, name = "is_featured")
    private Boolean isFeatured;

    @Field(type = FieldType.Boolean, name = "is_bestseller")
    private Boolean isBestseller;

    // Numeric fields
    @Field(type = FieldType.Double, name = "price")
    private BigDecimal price;

    @Field(type = FieldType.Double, name = "original_price")
    private BigDecimal originalPrice;

    @Field(type = FieldType.Double, name = "average_rating")
    private BigDecimal averageRating;

    @Field(type = FieldType.Integer, name = "total_enrollments")
    private Integer totalEnrollments;

    @Field(type = FieldType.Integer, name = "total_reviews")
    private Integer totalReviews;

    @Field(type = FieldType.Integer, name = "total_students")
    private Integer totalStudents;

    @Field(type = FieldType.Integer, name = "duration_minutes")
    private Integer durationMinutes;

    @Field(type = FieldType.Integer, name = "total_lectures")
    private Integer totalLectures;

    // Tag names — keyword array để filter chính xác
    @Field(type = FieldType.Keyword, name = "tag_names")
    private List<String> tagNames;

    // Instructor info (denormalized)
    @Field(type = FieldType.Keyword, name = "instructor_id")
    private String instructorId;

    @Field(type = FieldType.Text,
            analyzer = "standard",
            name = "instructor_name")
    private String instructorName;

    // Media
    @Field(type = FieldType.Keyword, name = "thumbnail_url", index = false)
    private String thumbnailUrl;

    @Field(type = FieldType.Keyword, name = "slug", index = false)
    private String slug;

    // Timestamps
    @Field(type = FieldType.Date,
            format = DateFormat.date_hour_minute_second,
            name = "published_at")
    private Instant publishedAt;

    @Field(type = FieldType.Date,
            format = DateFormat.date_hour_minute_second,
            name = "updated_at")
    private Instant updatedAt;

    // Popularity score (tính bởi BackgroundJob)
    @Field(type = FieldType.Double, name = "popularity_score")
    private Double popularityScore;
}