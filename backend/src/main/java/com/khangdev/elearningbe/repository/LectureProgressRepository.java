package com.khangdev.elearningbe.repository;

import com.khangdev.elearningbe.entity.course.LectureProgress;
import com.khangdev.elearningbe.entity.id.LectureProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LectureProgressRepository extends JpaRepository<LectureProgress, LectureProgressId> {
    Optional<LectureProgress> findByUserIdAndLectureId(UUID userId, UUID lectureId);


    @Query("""
        select lp from LectureProgress lp
        join lp.lecture l
        join l.section s
        where lp.user.id = :userId
        and s.course.id = :courseId
    """)
    List<LectureProgress> findByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);

    @Query("""
select count(lp) from LectureProgress lp
join lp.lecture l
join l.section s
where lp.user.id = :userId
and s.course.id = :courseId
and lp.completed = true
""")
    Long countCompletedByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);


    List<LectureProgress> findByBookmarkedTrueAndUserId(@Param("userId") UUID userId);



}
