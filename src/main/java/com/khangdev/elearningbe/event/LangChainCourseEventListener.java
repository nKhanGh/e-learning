package com.khangdev.elearningbe.event;

import com.khangdev.elearningbe.dto.request.course.CourseEmbeddingDTO;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.service.ai.CourseEmbeddingService;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PreRemove;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@RequiredArgsConstructor
public class LangChainCourseEventListener {

    private final CourseEmbeddingService courseEmbeddingService;
    private final CourseMapper courseMapper;

    @PostPersist
    @PostUpdate
    @Async
    public void onCourseChange(Course course) {
        if(course.getStatus() == CourseStatus.PUBLISHED){
            log.info("Embedding course with LangChain4j: {}", course.getId());
            CourseEmbeddingDTO dto = courseMapper.toCourseEmbeddingDTO(course);
            courseEmbeddingService.updateCourseEmbedding(dto);
        }
    }

    @PreRemove
    @Async
    public void onCourseRemove(Course course){
        log.info("Removing embedding course with LangChain4j: {}", course.getId());
        courseEmbeddingService.removeCourseEmbedding(course.getId());
    }
}
