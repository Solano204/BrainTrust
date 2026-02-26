package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatColonyJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatColonyJpaRepository extends JpaRepository<CatColonyJpaEntity, Integer> {

    List<CatColonyJpaEntity> findByMunicipalityId(Integer municipalityId);

    Page<CatColonyJpaEntity> findAll(Pageable pageable);

    Page<CatColonyJpaEntity> findByMunicipalityId(Integer municipalityId, Pageable pageable);

    Page<CatColonyJpaEntity> findByColonyNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<CatColonyJpaEntity> findByMunicipalityIdAndColonyNameIgnoreCase(Integer municipalityId, String name);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.colonyId = :id")
    long countPersonsByColonyId(@Param("id") Integer id);

    @Query("SELECT COUNT(s) FROM CatStreetJpaEntity s WHERE s.colonyId = :id")
    long countStreetsByColonyId(@Param("id") Integer id);
}