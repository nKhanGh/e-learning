package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.dto.request.course.CourseCategoryRequest;
import com.khangdev.elearningbe.dto.response.course.CourseCategoryResponse;
import com.khangdev.elearningbe.entity.course.CourseCategory;
import com.khangdev.elearningbe.mapper.CourseCategoryMapper;
import com.khangdev.elearningbe.repository.CourseCategoryRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
public class CourseCategoryServiceTest {

    @Autowired
    private CourseCategoryService courseCategoryService;

    @MockBean
    private CourseCategoryRepository courseCategoryRepository;

    @MockBean
    private CourseCategoryMapper courseCategoryMapper;

    @Test
    void createCourseCategory_success() {
        CourseCategoryRequest request = CourseCategoryRequest.builder()
                .name("Development")
                .build();

        CourseCategory category = CourseCategory.builder().name("Development").build();
        CourseCategoryResponse response = CourseCategoryResponse.builder().name("Development").build();

        Mockito.when(courseCategoryMapper.toCategory(request)).thenReturn(category);
        Mockito.when(courseCategoryMapper.toResponse(category)).thenReturn(response);

        CourseCategoryResponse result = courseCategoryService.createCourseCategory(request);

        Assertions.assertThat(result.getName()).isEqualTo("Development");
        Mockito.verify(courseCategoryRepository).save(category);
    }
}
