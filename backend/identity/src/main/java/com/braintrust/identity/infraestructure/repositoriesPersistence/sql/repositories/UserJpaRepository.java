package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, String> {

    // ── Básicos ───────────────────────────────────────────────────────────────
    Optional<UserJpaEntity> findByEmail(String email);
    Optional<UserJpaEntity> findByPersonId(String personId);
    List<UserJpaEntity>     findByActiveTrue();
    boolean                 existsByEmail(String email);
    Page<UserJpaEntity>     findAll(Pageable pageable);

    // ── Persona → Usuario(s) ──────────────────────────────────────────────────
    boolean             existsByPersonId(String personId);
    List<UserJpaEntity> findAllByPersonId(String personId);

    // ── Por rol (JPQL) — Hibernate resuelve el @JoinTable automáticamente ─────
    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    List<UserJpaEntity> findByRoleId(@Param("roleId") Integer roleId);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    Page<UserJpaEntity> findByRoleId(@Param("roleId") Integer roleId, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    Page<UserJpaEntity> findByRoleIdWithPerson(@Param("roleId") Integer roleId, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.active = true")
    Page<UserJpaEntity> findByActiveTrue(Pageable pageable);

    // ── Por lista de personIds (JPQL) ─────────────────────────────────────────
    @Query("SELECT u FROM UserJpaEntity u WHERE u.personId IN :personIds")
    Page<UserJpaEntity> findByPersonIdIn(
            @Param("personIds") List<String> personIds, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.personId IN :personIds AND u.role.id = :roleId")
    Page<UserJpaEntity> findByPersonIdInAndRoleId(
            @Param("personIds") List<String> personIds,
            @Param("roleId") Integer roleId,
            Pageable pageable);

    // =========================================================================
    // NATIVE QUERIES — CRITICAL:
    //
    // UserJpaEntity.role is mapped as @ManyToOne @JoinTable(user_roles).
    // Hibernate needs role_id in the ResultSet to hydrate that relationship.
    // "SELECT u.*" only returns users columns — role_id is NOT there.
    //
    // FIX: always SELECT u.*, ur.role_id in every native query.
    // The extra ur.role_id column lets Hibernate resolve the @JoinTable FK.
    //
    // Catalog column names (real schema):
    //   cat_first_names        → first_name
    //   cat_second_names       → second_name
    //   cat_paternal_lastnames → paternal_lastname   ← NOT "last_name"
    //   cat_maternal_lastnames → maternal_lastname   ← NOT "last_name"
    // =========================================================================

    // ── Búsqueda por nombre (cualquier rol) ───────────────────────────────────
    @Query(value = """
            SELECT DISTINCT u.*, ur.role_id FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE LOWER(fn.first_name)                LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(pln.paternal_lastname)         LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(sn.second_name,''))   LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(mln.maternal_lastname,'')) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name,
                                  pln.paternal_lastname, mln.maternal_lastname))
                  LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            countQuery = """
            SELECT COUNT(DISTINCT u.id) FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE LOWER(fn.first_name)                LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(pln.paternal_lastname)         LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(sn.second_name,''))   LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(COALESCE(mln.maternal_lastname,'')) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name,
                                  pln.paternal_lastname, mln.maternal_lastname))
                  LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            nativeQuery = true)
    Page<UserJpaEntity> findByNameContainingWithPerson(
            @Param("name") String name, Pageable pageable);

    // ── Búsqueda por nombre + rol (para enrollment search) ───────────────────
    @Query(value = """
            SELECT DISTINCT u.*, ur.role_id FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE (
                   LOWER(fn.first_name)                LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(pln.paternal_lastname)         LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(COALESCE(sn.second_name,''))   LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(COALESCE(mln.maternal_lastname,'')) LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name,
                                   pln.paternal_lastname, mln.maternal_lastname))
                   LIKE LOWER(CONCAT('%', :name, '%'))
              )
            """,
            countQuery = """
            SELECT COUNT(DISTINCT u.id) FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            LEFT JOIN cat_second_names       sn  ON sn.id  = p.segundo_nombre_id
            LEFT JOIN cat_maternal_lastnames mln ON mln.id = p.apellido_materno_id
            WHERE  (
                   LOWER(fn.first_name)                LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(pln.paternal_lastname)         LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(COALESCE(sn.second_name,''))   LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(COALESCE(mln.maternal_lastname,'')) LIKE LOWER(CONCAT('%', :name, '%'))
                OR LOWER(CONCAT_WS(' ', fn.first_name, sn.second_name,
                                   pln.paternal_lastname, mln.maternal_lastname))
                   LIKE LOWER(CONCAT('%', :name, '%'))
              )
            """,
            nativeQuery = true)
    Page<UserJpaEntity> findByNameAndRoleNative(
            @Param("name") String name,
            @Param("roleId") Integer roleId,
            Pageable pageable);

    // ── Ordenado por nombre ASC ───────────────────────────────────────────────
    @Query(value = """
            SELECT DISTINCT u.*, ur.role_id FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            WHERE ur.role_id = :roleId
            ORDER BY fn.first_name ASC, pln.paternal_lastname ASC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT u.id) FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            WHERE ur.role_id = :roleId
            """,
            nativeQuery = true)
    Page<UserJpaEntity> findByRoleIdOrderByPersonNameAsc(
            @Param("roleId") Integer roleId, Pageable pageable);

    // ── Ordenado por nombre DESC ──────────────────────────────────────────────
    @Query(value = """
            SELECT DISTINCT u.*, ur.role_id FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            JOIN persons p     ON p.id = u.person_id
            JOIN cat_first_names        fn  ON fn.id  = p.primer_nombre_id
            JOIN cat_paternal_lastnames pln ON pln.id = p.apellido_paterno_id
            WHERE ur.role_id = :roleId
            ORDER BY fn.first_name DESC, pln.paternal_lastname DESC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT u.id) FROM users u
            JOIN user_roles ur ON ur.user_id = u.id
            WHERE ur.role_id = :roleId
            """,
            nativeQuery = true)
    Page<UserJpaEntity> findByRoleIdOrderByPersonNameDesc(
            @Param("roleId") Integer roleId, Pageable pageable);
}