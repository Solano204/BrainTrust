package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatRoleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatRoleJpaRepository extends JpaRepository<CatRoleJpaEntity, Integer> {
    Optional<CatRoleJpaEntity> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}