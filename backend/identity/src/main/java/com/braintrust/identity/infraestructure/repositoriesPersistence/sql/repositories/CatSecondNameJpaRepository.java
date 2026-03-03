package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatSecondNameJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatSecondNameJpaRepository extends JpaRepository<CatSecondNameJpaEntity, Integer> {
    Optional<CatSecondNameJpaEntity> findBySecondNameIgnoreCase(String secondName);
}
