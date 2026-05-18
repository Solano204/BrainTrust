package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatStateJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatStateJpaRepository extends JpaRepository<CatStateJpaEntity, Integer> {

    Optional<CatStateJpaEntity> findByStateNameIgnoreCase(String stateName);

    Page<CatStateJpaEntity> findAll(Pageable pageable);

    Page<CatStateJpaEntity> findByStateNameContainingIgnoreCase(String search, Pageable pageable);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.stateId = :id")
    long countPersonsByStateId(@Param("id") Integer id);

    @Query("SELECT COUNT(m) FROM CatMunicipalityJpaEntity m WHERE m.stateId = :id")
    long countMunicipalitiesByStateId(@Param("id") Integer id);
}