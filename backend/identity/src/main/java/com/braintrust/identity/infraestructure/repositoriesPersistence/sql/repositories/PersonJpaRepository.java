package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonJpaRepository extends JpaRepository<PersonJpaEntity, String> {

    // ✅ NEW: Search methods with pagination
    @Query("SELECT p FROM PersonJpaEntity p WHERE " +
            "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<PersonJpaEntity> findByFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    // ✅ NEW: Search by first name
    Page<PersonJpaEntity> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);

    // ✅ NEW: Search by last name
    Page<PersonJpaEntity> findByLastNameContainingIgnoreCase(String lastName, Pageable pageable);

    // ✅ NEW: Search by phone
    Page<PersonJpaEntity> findByPhoneContaining(String phone, Pageable pageable);
}