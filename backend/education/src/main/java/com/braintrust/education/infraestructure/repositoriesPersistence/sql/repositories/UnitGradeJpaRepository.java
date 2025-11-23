package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.QuizSubmissionJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.UnitGradeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UnitGradeJpaRepository extends JpaRepository<UnitGradeJpaEntity, String> {

    Optional<UnitGradeJpaEntity> findByUnitIdAndStudentId(String unitId, String studentId);

    List<UnitGradeJpaEntity> findByUnitId(String unitId);

    List<UnitGradeJpaEntity> findByStudentId(String studentId);
; @Query("SELECT ug FROM UnitGradeJpaEntity ug " +
            "JOIN CourseUnitJpaEntity cu ON ug.unitId = cu.id " +
            "WHERE cu.courseId = :courseId AND ug.studentId = :studentId")
    List<UnitGradeJpaEntity> findByCourseIdAndStudentId(
                    @Param("courseId") String courseId,
                    @Param("studentId") String studentId);

}