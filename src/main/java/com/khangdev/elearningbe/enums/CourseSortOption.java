package com.khangdev.elearningbe.enums;

public enum CourseSortOption {
    RELEVANCE,      // ES _score + function_score
    NEWEST,         // published_at DESC
    RATING,         // average_rating DESC
    POPULARITY,     // total_enrollments DESC
    PRICE_ASC,
    PRICE_DESC
}
