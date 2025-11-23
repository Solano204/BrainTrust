package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseJpaRepository extends JpaRepository<CourseJpaEntity, String> {

    /*
    Optional<CourseJpaEntity> findByCode(String code);
    */

    @Query("SELECT DISTINCT c FROM CourseJpaEntity c JOIN c.enrollments e WHERE e.studentId = :studentId AND e.status = 'ACTIVE'")
    List<CourseJpaEntity> findByStudentId(@Param("studentId") String studentId);

    List<CourseJpaEntity> findByTeacherId(String teacherId);


    /*
    List<CourseJpaEntity> findByActiveTrue();
    */

    /*
    List<CourseJpaEntity> findByGradeAndGroup(String grade, String group);
    */

    boolean existsByCode(String code);

    @Query("SELECT c FROM CourseJpaEntity c JOIN c.units u WHERE u.id = :unitId")
    Optional<CourseJpaEntity> findByUnitId(@Param("unitId") String unitId);
}