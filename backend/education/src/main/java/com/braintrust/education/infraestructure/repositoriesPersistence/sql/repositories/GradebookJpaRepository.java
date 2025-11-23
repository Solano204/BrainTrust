package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.GradebookJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GradebookJpaRepository extends JpaRepository<GradebookJpaEntity, String> {

    Optional<GradebookJpaEntity> findByCourseIdAndStudentId(String courseId, String studentId);

    List<GradebookJpaEntity> findByCourseId(String courseId);

    boolean existsByCourseIdAndStudentId(String courseId, String studentId);
}