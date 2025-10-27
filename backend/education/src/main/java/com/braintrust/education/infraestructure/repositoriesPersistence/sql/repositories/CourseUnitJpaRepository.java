package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseUnitJpaRepository extends JpaRepository<CourseUnitJpaEntity, String> {

    List<CourseUnitJpaEntity> findByCourseId(String courseId);

    List<CourseUnitJpaEntity> findByCourseIdOrderByNumUnity(String courseId);
}