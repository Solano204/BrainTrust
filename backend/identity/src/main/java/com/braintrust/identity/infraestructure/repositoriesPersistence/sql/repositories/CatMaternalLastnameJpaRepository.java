package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;


import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatMaternalLastnameJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatMaternalLastnameJpaRepository extends JpaRepository<CatMaternalLastnameJpaEntity, Integer> {
    Optional<CatMaternalLastnameJpaEntity> findByMaternalLastnameIgnoreCase(String maternalLastname);
}
