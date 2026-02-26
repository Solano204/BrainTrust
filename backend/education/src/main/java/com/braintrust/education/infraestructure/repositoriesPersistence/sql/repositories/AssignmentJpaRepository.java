package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import org.springframework.data.jpa.repository.EntityGraph;
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
    List<AssignmentJpaEntity> findByCourseIdAndUnit(String courseId, String unitId);
    List<AssignmentJpaEntity> findByCourseIdAndActiveTrue(String courseId);
    List<AssignmentJpaEntity> findByCourseIdAndDueDateBetween(String courseId, LocalDateTime start, LocalDateTime end);


    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.documents LEFT JOIN FETCH a.links WHERE a.id = :id")
    Optional<AssignmentJpaEntity> findByIdWithDocuments(@Param("id") String id);


    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.documents LEFT JOIN FETCH a.links WHERE a.courseId = :courseId")
    List<AssignmentJpaEntity> findByCourseIdWithDocuments(@Param("courseId") String courseId);


    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.links WHERE a.id = :id")
    Optional<AssignmentJpaEntity> findByIdWithLinks(@Param("id") String id);




    @Query("""
        SELECT a FROM AssignmentJpaEntity a 
        LEFT JOIN FETCH a.documents 
        LEFT JOIN FETCH a.links 
        WHERE a.courseId IN (
            SELECT c.id FROM CourseJpaEntity c 
            WHERE c.teacherId = :teacherId
        )
        ORDER BY a.createdAt DESC
    """)
    List<AssignmentJpaEntity> findByTeacherId(@Param("teacherId") String teacherId);


    @Query("SELECT a FROM AssignmentJpaEntity a LEFT JOIN FETCH a.documents LEFT JOIN FETCH a.links WHERE a.courseId = :courseId AND a.active = true")
    List<AssignmentJpaEntity> findActiveAssignmentsByCourse(@Param("courseId") String courseId);

    @Query("""
        SELECT a FROM AssignmentJpaEntity a 
        LEFT JOIN FETCH a.documents 
        LEFT JOIN FETCH a.links 
        WHERE a.courseId = :courseId 
        AND a.dueDate BETWEEN :start AND :end 
        AND a.active = true
        ORDER BY a.dueDate ASC
    """)
    List<AssignmentJpaEntity> findAssignmentsDueBetween(
            @Param("courseId") String courseId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );



    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("SELECT a FROM AssignmentJpaEntity a WHERE a.id = :id")
    Optional<AssignmentJpaEntity> findByIdWithDocumentsAndLinks(@Param("id") String id);

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("SELECT a FROM AssignmentJpaEntity a WHERE a.courseId = :courseId")
    List<AssignmentJpaEntity> findByCourseIdWithDocumentsAndLinks(@Param("courseId") String courseId);

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("SELECT a FROM AssignmentJpaEntity a WHERE a.courseId = :courseId AND a.unit = :unitId")
    List<AssignmentJpaEntity> findByCourseIdAndUnitId(@Param("courseId") String courseId,
                                                      @Param("unitId") String unitId);

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("""
        SELECT a FROM AssignmentJpaEntity a 
        WHERE a.courseId = :courseId 
        AND a.unit = :unitId
        AND a.id IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
            AND e.status = 'ACTIVE'
        )
        AND a.active = true
    """)
    List<AssignmentJpaEntity> findByStudentCourseUnit(
            @Param("studentId") String studentId,
            @Param("courseId") String courseId,
            @Param("unitId") String unitId
    );

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
        WHERE a.courseId IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
         
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

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
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

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
        WHERE a.courseId IN (
            SELECT e.courseId FROM EnrollmentJpaEntity e 
            WHERE e.studentId = :studentId 
            
        )
        AND a.dueDate >= :monthStart 
        AND a.dueDate < :monthEnd
        AND a.active = true
        ORDER BY a.dueDate ASC
    """)
    List<AssignmentJpaEntity> findAssignmentsByStudentForMonth(
            @Param("studentId") String studentId,
            @Param("monthStart") LocalDateTime monthStart,
            @Param("monthEnd") LocalDateTime monthEnd
    );

    @EntityGraph(attributePaths = {"documents", "links"})
    @Query("""
        SELECT DISTINCT a FROM AssignmentJpaEntity a 
        WHERE a.courseId IN (
            SELECT c.id FROM CourseJpaEntity c 
            WHERE c.teacherId = :teacherId
        )
        AND a.dueDate >= :monthStart 
        AND a.dueDate < :monthEnd
        AND a.active = true
        ORDER BY a.dueDate ASC
    """)
    List<AssignmentJpaEntity> findAssignmentsByTeacherForMonth(
            @Param("teacherId") String teacherId,
            @Param("monthStart") LocalDateTime monthStart,
            @Param("monthEnd") LocalDateTime monthEnd
    );


    @EntityGraph(attributePaths = {"documents", "links"})
    List<AssignmentJpaEntity> findAll();

}