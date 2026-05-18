package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.PageJpaEntity;
import io.micrometer.common.KeyValues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PageJpaRepository extends JpaRepository<PageJpaEntity, String> {



    List<PageJpaEntity> findByCourseId(String courseId);

    List<PageJpaEntity> findByCourseIdAndPublishedTrue(String courseId);

    List<PageJpaEntity>  findByUnitId(String value);
}