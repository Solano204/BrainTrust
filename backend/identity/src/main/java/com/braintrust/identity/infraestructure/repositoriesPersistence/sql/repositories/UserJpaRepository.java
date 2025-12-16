package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
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
    List<UserJpaEntity> findByRole(Role role);
    List<UserJpaEntity> findByActiveTrue();
    boolean existsByEmail(String email);

    // ✅ FIXED: Removed ALL ORDER BY clauses - let Pageable handle sorting through the controller
    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
            "LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<UserJpaEntity> findByNameContainingWithPerson(@Param("name") String name, Pageable pageable);

    // Keep these for explicit sorting when needed
    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE u.role = :role ORDER BY p.firstName ASC, p.lastName ASC")
    Page<UserJpaEntity> findByRoleOrderByPersonNameAsc(@Param("role") Role role, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE u.role = :role ORDER BY p.firstName DESC, p.lastName DESC")
    Page<UserJpaEntity> findByRoleOrderByPersonNameDesc(@Param("role") Role role, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE u.role = :role")
    Page<UserJpaEntity> findByRoleWithPerson(@Param("role") Role role, Pageable pageable);

    Page<UserJpaEntity> findByRole(Role role, Pageable pageable);
    Page<UserJpaEntity> findAll(Pageable pageable);
    Page<UserJpaEntity> findByActiveTrue(Pageable pageable);

    // ✅ CRITICAL FIX: Removed ALL ORDER BY clauses
    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE u.personId IN :personIds")
    Page<UserJpaEntity> findByPersonIdIn(@Param("personIds") List<String> personIds, Pageable pageable);

    @Query("SELECT u FROM UserJpaEntity u JOIN PersonJpaEntity p ON u.personId = p.id " +
            "WHERE u.personId IN :personIds AND u.role = :role")
    Page<UserJpaEntity> findByPersonIdInAndRole(
            @Param("personIds") List<String> personIds,
            @Param("role") Role role,
            Pageable pageable);
}