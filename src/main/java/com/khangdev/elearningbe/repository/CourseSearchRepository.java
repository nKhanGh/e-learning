package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.document.CourseDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface CourseSearchRepository extends ElasticsearchRepository<CourseDocument, String> {

}
