package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.CourseTagRequest;
import com.khangdev.elearningbe.dto.response.course.CourseTagResponse;
import com.khangdev.elearningbe.entity.course.CourseTag;
import com.khangdev.elearningbe.mapper.CourseTagMapper;
import com.khangdev.elearningbe.repository.CourseTagRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;

@SpringBootTest
public class CourseTagServiceTest {

    @Autowired
    private CourseTagService courseTagService;

    @MockBean
    private CourseTagRepository courseTagRepository;

    @MockBean
    private CourseTagMapper courseTagMapper;

    @Test
    void createCourseTag_success() {
        CourseTagRequest request = CourseTagRequest.builder()
                .name("Java")
                .build();

        CourseTagResponse response = CourseTagResponse.builder().name("Java").build();

        Mockito.when(courseTagRepository.findBySlug("java"))
                .thenReturn(Optional.empty());
        Mockito.when(courseTagMapper.toCourseTagResponse(ArgumentMatchers.any(CourseTag.class)))
                .thenReturn(response);

        CourseTagResponse result = courseTagService.createCourseTag(request);

        Assertions.assertThat(result.getName()).isEqualTo("Java");
        Mockito.verify(courseTagRepository).save(ArgumentMatchers.any(CourseTag.class));
    }

    @Test
    void createCourseTag_existingTag_returnExisting() {
        CourseTagRequest request = CourseTagRequest.builder()
                .name("Java")
                .build();

        CourseTag existing = CourseTag.builder().name("Java").slug("java").build();
        CourseTagResponse response = CourseTagResponse.builder().name("Java").build();

        Mockito.when(courseTagRepository.findBySlug("java"))
                .thenReturn(Optional.of(existing));
        Mockito.when(courseTagMapper.toCourseTagResponse(existing))
                .thenReturn(response);

        CourseTagResponse result = courseTagService.createCourseTag(request);

        Assertions.assertThat(result.getName()).isEqualTo("Java");
        Mockito.verify(courseTagRepository, Mockito.never()).save(ArgumentMatchers.any(CourseTag.class));
    }
}
