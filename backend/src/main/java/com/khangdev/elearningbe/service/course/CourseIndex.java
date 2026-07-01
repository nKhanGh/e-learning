package com.khangdev.elearningbe.service.course;

import org.springframework.kafka.support.Acknowledgment;

public interface CourseIndex {
    void onCoursePublished(String courseId, Acknowledgment ack);
    void onCourseStatsUpdated(String courseId, Acknowledgment ack);
    void onCourseDeleted(String courseId, Acknowledgment ack);
    void fullReindex();
    void updatePopularityScores();

}
