package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatLastNameJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatLastNameJpaRepository extends JpaRepository<CatLastNameJpaEntity, Integer> {

    Optional<CatLastNameJpaEntity> findByLastNameIgnoreCase(String lastName);

    Page<CatLastNameJpaEntity> findAll(Pageable pageable);

    Page<CatLastNameJpaEntity> findByLastNameContainingIgnoreCase(String search, Pageable pageable);
    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.apellidoPaternoId = :id")

    long countPersonsByLastNameId(@Param("id") Integer id);
}