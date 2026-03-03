package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatPaternalLastnameJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatPaternalLastnameJpaRepository extends JpaRepository<CatPaternalLastnameJpaEntity, Integer> {
    Optional<CatPaternalLastnameJpaEntity> findByPaternalLastnameIgnoreCase(String paternalLastname);
}