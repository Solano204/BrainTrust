package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatPostalCodeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatPostalCodeJpaRepository extends JpaRepository<CatPostalCodeJpaEntity, Integer> {

    List<CatPostalCodeJpaEntity> findByColonyId(Integer colonyId);

    Page<CatPostalCodeJpaEntity> findAll(Pageable pageable);

    Page<CatPostalCodeJpaEntity> findByColonyId(Integer colonyId, Pageable pageable);

    Page<CatPostalCodeJpaEntity> findByPostalCodeContaining(String search, Pageable pageable);

    Optional<CatPostalCodeJpaEntity> findByColonyIdAndPostalCode(Integer colonyId, String postalCode);

    @Query("SELECT COUNT(p) FROM PersonJpaEntity p WHERE p.postalCodeId = :id")
    long countPersonsByPostalCodeId(@Param("id") Integer id);
}