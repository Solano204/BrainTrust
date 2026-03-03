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

    // Columnas reales según el schema:
    //   cat_first_names        → first_name
    //   cat_second_names       → second_name
    //   cat_paternal_lastnames → paternal_lastname   ← NO es "last_name"
    //   cat_maternal_lastnames → maternal_lastname   ← NO es "last_name"
    //   FK en persons          → primer_nombre_id, segundo_nombre_id,
    //                            apellido_paterno_id, apellido_materno_id

    @Query(value = """
            SELECT p.* FROM persons p
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE LOWER(fn.first_name)                                   LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(pln.paternal_lastname)                            LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(sn.second_name, ''))                     LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(mln.maternal_lastname, ''))              LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT(fn.first_name, ' ', pln.paternal_lastname)) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name, pln.paternal_lastname, mln.maternal_lastname))
                    LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            countQuery = """
            SELECT COUNT(p.id) FROM persons p
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE LOWER(fn.first_name)                                   LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(pln.paternal_lastname)                            LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(sn.second_name, ''))                     LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(mln.maternal_lastname, ''))              LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT(fn.first_name, ' ', pln.paternal_lastname)) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name, pln.paternal_lastname, mln.maternal_lastname))
                    LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            nativeQuery = true)
    Page<PersonJpaEntity> findByFullNameContainingIgnoreCase(
            @Param("name") String name, Pageable pageable);

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