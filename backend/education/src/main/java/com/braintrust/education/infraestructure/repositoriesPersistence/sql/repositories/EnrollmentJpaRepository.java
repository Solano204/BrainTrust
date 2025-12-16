package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentJpaRepository extends JpaRepository<EnrollmentJpaEntity, String> {

    Optional<EnrollmentJpaEntity> findByCourseIdAndStudentId(String courseId, String studentId);

    List<EnrollmentJpaEntity> findByCourseId(String courseId);

    List<EnrollmentJpaEntity> findByStudentId(String studentId);

    @Query("SELECT e FROM EnrollmentJpaEntity e WHERE e.courseId = :courseId AND e.status = 'ACTIVE'")
    List<EnrollmentJpaEntity> findActiveByCourseId(@Param("courseId") String courseId);

    boolean existsByCourseIdAndStudentId(String courseId, String studentId);

    // NEW METHOD: Count enrollments by course and status
    long countByCourseIdAndStatus(String courseId, String status);

    // NEW METHOD: Find student IDs by course and status
    @Query("SELECT e.studentId FROM EnrollmentJpaEntity e WHERE e.courseId = :courseId AND e.status = :status")
    List<String> findStudentIdsByCourseIdAndStatus(@Param("courseId") String courseId, @Param("status") String status);
}