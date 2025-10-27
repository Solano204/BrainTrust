package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseJpaRepository extends JpaRepository<CourseJpaEntity, String> {

    Optional<CourseJpaEntity> findByCode(String code);
    List<CourseJpaEntity> findByTeacherId(String teacherId);
    List<CourseJpaEntity> findByActiveTrue();
    List<CourseJpaEntity> findByGradeAndGroup(String grade, String group);
    boolean existsByCode(String code);
}