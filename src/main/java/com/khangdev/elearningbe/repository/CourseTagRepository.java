package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.CourseTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseTagRepository extends JpaRepository<CourseTag, UUID> {
    List<CourseTag> findAllBySlugIn(List<String> slugs);
    Optional<CourseTag> findBySlug(String slug);
}
