package com.khangdev.elearningbe.entity.course;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "course_tags", indexes = {
        @Index(name = "idx_slug", columnList = "slug")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(name = "usage_count")
    @Builder.Default
    private Integer usageCount = 0;

    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private List<Course> courses = new ArrayList<>();

}
