package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatStreetJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatStreetJpaRepository extends JpaRepository<CatStreetJpaEntity, Integer> {

    List<CatStreetJpaEntity> findByColonyId(Integer colonyId);

    Page<CatStreetJpaEntity> findAll(Pageable pageable);

    Page<CatStreetJpaEntity> findByColonyId(Integer colonyId, Pageable pageable);

    Page<CatStreetJpaEntity> findByStreetNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<CatStreetJpaEntity> findByColonyIdAndStreetNameIgnoreCase(Integer colonyId, String streetName);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.streetId = :id")
    long countPersonsByStreetId(@Param("id") Integer id);
}