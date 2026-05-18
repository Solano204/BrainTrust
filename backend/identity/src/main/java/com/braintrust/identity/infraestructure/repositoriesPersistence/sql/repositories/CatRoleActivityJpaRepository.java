package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatRoleActivityJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatRoleActivityJpaRepository extends JpaRepository<CatRoleActivityJpaEntity, Integer> {

    List<CatRoleActivityJpaEntity> findByRoleId(Integer roleId);

    Page<CatRoleActivityJpaEntity> findByRoleId(Integer roleId, Pageable pageable);

    Optional<CatRoleActivityJpaEntity> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    // ✅ FIXED: u.roleId → u.role.id
    @Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.role.id = :roleId")
    long countUsersByRoleId(@Param("roleId") Integer roleId);
}