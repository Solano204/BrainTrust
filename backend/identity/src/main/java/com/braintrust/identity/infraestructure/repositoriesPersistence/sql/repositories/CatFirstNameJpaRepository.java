package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatFirstNameJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CatFirstNameJpaRepository extends JpaRepository<CatFirstNameJpaEntity, Integer> {

    Optional<CatFirstNameJpaEntity> findByFirstNameIgnoreCase(String firstName);

    Page<CatFirstNameJpaEntity> findAll(Pageable pageable);

    Page<CatFirstNameJpaEntity> findByFirstNameContainingIgnoreCase(String search, Pageable pageable);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.firstNameId = :id")
    long countPersonsByFirstNameId(@Param("id") Integer id);
}