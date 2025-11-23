package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.StudentGroupJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentGroupJpaRepository extends JpaRepository<StudentGroupJpaEntity, String> {

    List<StudentGroupJpaEntity> findByCourseId(String courseId);

    List<StudentGroupJpaEntity> findByCourseIdAndActiveTrue(String courseId);

    @Query("SELECT g FROM StudentGroupJpaEntity g WHERE :studentId MEMBER OF g.memberIds")
    List<StudentGroupJpaEntity> findByMemberId(@Param("studentId") String studentId);

    boolean existsByNameAndCourseId(String name, String courseId);
}