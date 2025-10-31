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



    // ✅ NEW: Find assignments for a student across all their enrolled courses for a specific week
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
        LEFT JOIN FETCH a.documents
        WHERE a.courseId IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
            AND e.status = 'ACTIVE'
        )
        AND a.dueDate >= :weekStart 
        AND a.dueDate < :weekEnd
        AND a.active = true
        ORDER BY a.dueDate ASC
    """)
    List<AssignmentJpaEntity> findAssignmentsByStudentForWeek(
            @Param("studentId") String studentId,
            @Param("weekStart") LocalDateTime weekStart,
            @Param("weekEnd") LocalDateTime weekEnd
    );

    // ✅ NEW: Find assignments for a teacher across all their courses for a specific week
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
        LEFT JOIN FETCH a.documents
        WHERE a.courseId IN (
            SELECT c.id FROM CourseJpaEntity c 
            WHERE c.teacherId = :teacherId
        )
        AND a.dueDate >= :weekStart 
        AND a.dueDate < :weekEnd
        AND a.active = true
        ORDER BY a.dueDate ASC
    """)
    List<AssignmentJpaEntity> findAssignmentsByTeacherForWeek(
            @Param("teacherId") String teacherId,
            @Param("weekStart") LocalDateTime weekStart,
            @Param("weekEnd") LocalDateTime weekEnd
    );

}