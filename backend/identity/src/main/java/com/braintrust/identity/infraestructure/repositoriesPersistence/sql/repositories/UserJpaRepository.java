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

    Optional<UserJpaEntity> findByEmail(String email);
    Optional<UserJpaEntity> findByPersonId(String personId);
    List<UserJpaEntity> findByActiveTrue();
    boolean existsByEmail(String email);
    Page<UserJpaEntity> findAll(Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    List<UserJpaEntity> findByRoleId(@Param("roleId") Integer roleId);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    Page<UserJpaEntity> findByRoleId(@Param("roleId") Integer roleId, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.active = true")
    Page<UserJpaEntity> findByActiveTrue(Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.personId IN :personIds")
    Page<UserJpaEntity> findByPersonIdIn(
            @Param("personIds") List<String> personIds, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.personId IN :personIds AND u.role.id = :roleId")
    Page<UserJpaEntity> findByPersonIdInAndRoleId(
            @Param("personIds") List<String> personIds,
            @Param("roleId") Integer roleId,
            Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.role.id = :roleId")
    Page<UserJpaEntity> findByRoleIdWithPerson(
            @Param("roleId") Integer roleId, Pageable pageable);

    // Native queries use SQL column names  these stay the same
    // because they join through user_roles table directly
    @Query(value = """
            SELECT u.* FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN persons p ON u.person_id = p.id
            JOIN cat_first_names fn ON p.first_name_id = fn.id
            JOIN cat_last_names ln ON p.last_name_id = ln.id
            WHERE LOWER(fn.first_name) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(ln.last_name) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT(fn.first_name, ' ', ln.last_name)) LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            countQuery = """
            SELECT COUNT(u.id) FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN persons p ON u.person_id = p.id
            JOIN cat_first_names fn ON p.first_name_id = fn.id
            JOIN cat_last_names ln ON p.last_name_id = ln.id
            WHERE LOWER(fn.first_name) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(ln.last_name) LIKE LOWER(CONCAT('%', :name, '%'))
               OR LOWER(CONCAT(fn.first_name, ' ', ln.last_name)) LIKE LOWER(CONCAT('%', :name, '%'))
            """,
            nativeQuery = true)
    Page<UserJpaEntity> findByNameContainingWithPerson(
            @Param("name") String name, Pageable pageable);

    @Query(value = """
            SELECT u.* FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN persons p ON u.person_id = p.id
            JOIN cat_first_names fn ON p.first_name_id = fn.id
            JOIN cat_last_names ln ON p.last_name_id = ln.id
            WHERE ur.role_id = :roleId
            ORDER BY fn.first_name ASC, ln.last_name ASC
            """,
            countQuery = "SELECT COUNT(u.id) FROM users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role_id = :roleId",
            nativeQuery = true)
    Page<UserJpaEntity> findByRoleIdOrderByPersonNameAsc(
            @Param("roleId") Integer roleId, Pageable pageable);

    @Query(value = """
            SELECT u.* FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN persons p ON u.person_id = p.id
            JOIN cat_first_names fn ON p.first_name_id = fn.id
            JOIN cat_last_names ln ON p.last_name_id = ln.id
            WHERE ur.role_id = :roleId
            ORDER BY fn.first_name DESC, ln.last_name DESC
            """,
            countQuery = "SELECT COUNT(u.id) FROM users u JOIN user_roles ur ON u.id = ur.user_id WHERE ur.role_id = :roleId",
            nativeQuery = true)
    Page<UserJpaEntity> findByRoleIdOrderByPersonNameDesc(
            @Param("roleId") Integer roleId, Pageable pageable);
}