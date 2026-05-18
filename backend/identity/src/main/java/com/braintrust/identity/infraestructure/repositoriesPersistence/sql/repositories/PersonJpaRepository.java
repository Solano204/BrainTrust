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


    // Native query to search persons by joining with catalogs
    @Query(value = """
        SELECT p.*, fn.first_name, ln.last_name,
               s.street_name AS address_street,
               col.colony_name AS address_colony,
               m.municipality_name AS address_municipality,
               st.state_name AS address_state,
               pc.postal_code AS address_postal_code
        FROM persons p
        JOIN cat_first_names fn ON p.first_name_id = fn.id
        JOIN cat_last_names ln ON p.last_name_id = ln.id
        LEFT JOIN cat_streets s ON p.street_id = s.id
        LEFT JOIN cat_colonies col ON p.colony_id = col.id
        LEFT JOIN cat_municipalities m ON p.municipality_id = m.id
        LEFT JOIN cat_states st ON p.state_id = st.id
        LEFT JOIN cat_postal_codes pc ON p.postal_code_id = pc.id
        WHERE LOWER(CONCAT(fn.first_name, ' ', ln.last_name)) LIKE LOWER(CONCAT('%', :name, '%'))
           OR LOWER(fn.first_name) LIKE LOWER(CONCAT('%', :name, '%'))
           OR LOWER(ln.last_name) LIKE LOWER(CONCAT('%', :name, '%'))
        """,
            countQuery = """
        SELECT COUNT(p.id) FROM persons p
        JOIN cat_first_names fn ON p.first_name_id = fn.id
        JOIN cat_last_names ln ON p.last_name_id = ln.id
        WHERE LOWER(CONCAT(fn.first_name, ' ', ln.last_name)) LIKE LOWER(CONCAT('%', :name, '%'))
           OR LOWER(fn.first_name) LIKE LOWER(CONCAT('%', :name, '%'))
           OR LOWER(ln.last_name) LIKE LOWER(CONCAT('%', :name, '%'))
        """,
            nativeQuery = true)
    Page<PersonJpaEntity> findByFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    Page<PersonJpaEntity> findByPhoneContaining(String phone, Pageable pageable);

    // jasj



//    @Query("SELECT p FROM PersonJpaEntity p WHERE " +
//            "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
//            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
//            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
//    Page<PersonJpaEntity> findByFullNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);


    Page<PersonJpaEntity> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);


    Page<PersonJpaEntity> findByLastNameContainingIgnoreCase(String lastName, Pageable pageable);


   // Page<PersonJpaEntity> findByPhoneContaining(String phone, Pageable pageable);
}