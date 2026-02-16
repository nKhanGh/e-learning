package com.khangdev.elearningbe.job;

import com.khangdev.elearningbe.dto.request.course.CourseEmbeddingDTO;
import com.khangdev.elearningbe.entity.course.Course;
import com.khangdev.elearningbe.enums.CourseStatus;
import com.khangdev.elearningbe.mapper.CourseMapper;
import com.khangdev.elearningbe.repository.CourseRepository;
import com.khangdev.elearningbe.service.ai.CourseEmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LangChainCourseEmbeddingJob implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CourseEmbeddingService embeddingService;

    private final CourseMapper courseMapper;

    @Override
    public void run(String... args) {
        log.info("Start LangChain4j course embedding job");
        try {
            List<Course> courses = courseRepository.findByStatus(CourseStatus.PUBLISHED);
            log.info("Found {} published courses to embed", courses.size());

            List<CourseEmbeddingDTO> dtos = courses.stream()
                    .map(courseMapper::toCourseEmbeddingDTO)
                    .toList();

            embeddingService.embedCourses(dtos);
            log.info("Successfully embedded {} courses with LangChain4j", dtos.size());

        } catch (Exception e) {
            log.error("Error in LangChain4j embedding job: {}", e.getMessage(), e);
        }
    }
}
