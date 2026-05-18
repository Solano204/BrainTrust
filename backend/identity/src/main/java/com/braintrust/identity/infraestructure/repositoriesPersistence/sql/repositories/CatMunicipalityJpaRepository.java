package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatMunicipalityJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatMunicipalityJpaRepository extends JpaRepository<CatMunicipalityJpaEntity, Integer> {

    List<CatMunicipalityJpaEntity> findByStateId(Integer stateId);

    Page<CatMunicipalityJpaEntity> findAll(Pageable pageable);

    Page<CatMunicipalityJpaEntity> findByStateId(Integer stateId, Pageable pageable);

    Page<CatMunicipalityJpaEntity> findByMunicipalityNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<CatMunicipalityJpaEntity> findByStateIdAndMunicipalityNameIgnoreCase(Integer stateId, String name);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.municipalityId = :id")
    long countPersonsByMunicipalityId(@Param("id") Integer id);

    @Query("SELECT COUNT(c) FROM CatColonyJpaEntity c WHERE c.municipalityId = :id")
    long countColoniesByMunicipalityId(@Param("id") Integer id);
}