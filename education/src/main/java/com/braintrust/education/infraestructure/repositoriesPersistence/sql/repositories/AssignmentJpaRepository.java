package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentJpaRepository extends JpaRepository<AssignmentJpaEntity, String> {

    List<AssignmentJpaEntity> findByCourseId(String courseId);
    List<AssignmentJpaEntity> findByCourseIdAndActiveTrue(String courseId);
    List<AssignmentJpaEntity> findByCourseIdAndDueDateBetween(String courseId, LocalDateTime start, LocalDateTime end);
    // ✅ Query personalizada que carga documentos explícitamente
    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.documents WHERE a.id = :id")
    Optional<AssignmentJpaEntity> findByIdWithDocuments(@Param("id") String id);

    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.documents WHERE a.courseId = :courseId")
    List<AssignmentJpaEntity> findByCourseIdWithDocuments(@Param("courseId") String courseId);
}