package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.dtos.catalog.*;
import com.braintrust.identity.domain.exceptions.CatalogInUseException;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleActivityService {

    private static final Logger log = LoggerFactory.getLogger(RoleActivityService.class);

    private final CatRoleJpaRepository roleRepo;
    private final CatRoleActivityJpaRepository activityRepo;

    public RoleActivityService(CatRoleJpaRepository roleRepo,
                               CatRoleActivityJpaRepository activityRepo) {
        this.roleRepo = roleRepo;
        this.activityRepo = activityRepo;
    }

    // ==================== ROLES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatRoleDTO> getAllRoles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("code").ascending());
        Page<CatRoleJpaEntity> result = roleRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(this::toRoleDTO)
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<CatRoleDTO> getAllRolesList() {
        return roleRepo.findAll(Sort.by("code")).stream()
                .map(this::toRoleDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CatRoleDTO getRoleById(Integer id) {
        CatRoleJpaEntity entity = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));
        return toRoleDTO(entity);
    }

    public CatRoleDTO createRole(String code, String description) {
        if (roleRepo.existsByCodeIgnoreCase(code.trim())) {
            throw new IllegalArgumentException("Role with code '" + code + "' already exists");
        }
        CatRoleJpaEntity entity = roleRepo.save(new CatRoleJpaEntity(code.trim().toUpperCase(), description.trim()));
        return toRoleDTO(entity);
    }

    public CatRoleDTO updateRole(Integer id, String code, String description) {
        CatRoleJpaEntity entity = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));

        // Check if the new code conflicts with another role
        roleRepo.findByCodeIgnoreCase(code.trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Role with code '" + code + "' already exists");
            }
        });

        entity.setCode(code.trim().toUpperCase());
        entity.setDescription(description.trim());
        CatRoleJpaEntity saved = roleRepo.save(entity);
        return toRoleDTO(saved);
    }

    public void deleteRole(Integer id) {
        CatRoleJpaEntity entity = roleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));

        long userCount = activityRepo.countUsersByRoleId(id);
        if (userCount > 0) {
            throw new CatalogInUseException("Cannot delete role '" + entity.getCode() +
                    "': assigned to " + userCount + " user(s)");
        }
        // Delete all activities of the role first (or rely on CASCADE if configured)
        activityRepo.findByRoleId(id).forEach(a -> activityRepo.deleteById(a.getId()));
        roleRepo.deleteById(id);
    }

    // ==================== ROLE ACTIVITIES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogRoleActivityDTO> getAllActivities(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("code").ascending());
        Page<CatRoleActivityJpaEntity> result = activityRepo.findAll(pageable);
        return PagedResponseDTO.of(toActivityDTOs(result.getContent(), null),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogRoleActivityDTO> getActivitiesByRole(Integer roleId, int page, int size) {
        // Validate role exists
        CatRoleJpaEntity role = roleRepo.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("code").ascending());
        Page<CatRoleActivityJpaEntity> result = activityRepo.findByRoleId(roleId, pageable);
        return PagedResponseDTO.of(toActivityDTOs(result.getContent(), role),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public CatalogRoleActivityDTO getActivityById(Integer id) {
        CatRoleActivityJpaEntity entity = activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found: " + id));
        return toDTO(entity);
    }

    public CatalogRoleActivityDTO createActivity(CatalogRoleActivityRequest request) {
        // Validate role
        roleRepo.findById(request.roleId())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.roleId()));

        if (activityRepo.existsByCodeIgnoreCase(request.code().trim())) {
            throw new IllegalArgumentException("Activity with code '" + request.code() + "' already exists");
        }

        CatRoleActivityJpaEntity entity = new CatRoleActivityJpaEntity();
        entity.setRoleId(request.roleId());
        entity.setCode(request.code().trim().toUpperCase());
        entity.setActivity(request.activity().trim());
        entity.setDescription(request.description() != null ? request.description().trim() : null);

        return toDTO(activityRepo.save(entity));
    }

    public CatalogRoleActivityDTO updateActivity(Integer id, CatalogRoleActivityRequest request) {
        CatRoleActivityJpaEntity entity = activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found: " + id));

        // Validate role exists
        roleRepo.findById(request.roleId())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.roleId()));

        // Check code conflict with other activity
        activityRepo.findByCodeIgnoreCase(request.code().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Activity with code '" + request.code() + "' already exists");
            }
        });

        entity.setRoleId(request.roleId());
        entity.setCode(request.code().trim().toUpperCase());
        entity.setActivity(request.activity().trim());
        entity.setDescription(request.description() != null ? request.description().trim() : null);

        return toDTO(activityRepo.save(entity));
    }

    public void deleteActivity(Integer id) {
        activityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found: " + id));
        activityRepo.deleteById(id);
    }

    // ==================== HELPERS ====================

    private CatRoleDTO toRoleDTO(CatRoleJpaEntity role) {
        List<CatRoleDTO.RoleActivitySummaryDTO> activities = activityRepo
                .findByRoleId(role.getId())
                .stream()
                .sorted(java.util.Comparator.comparing(CatRoleActivityJpaEntity::getCode))
                .map(a -> new CatRoleDTO.RoleActivitySummaryDTO(
                        a.getId(), a.getCode(), a.getActivity(), a.getDescription()))
                .collect(Collectors.toList());
        return new CatRoleDTO(role.getId(), role.getCode(), role.getDescription(), activities);
    }

    private List<CatalogRoleActivityDTO> toActivityDTOs(
            List<CatRoleActivityJpaEntity> entities, CatRoleJpaEntity knownRole) {
        return entities.stream()
                .map(e -> {
                    String roleCode = null;
                    if (knownRole != null && knownRole.getId().equals(e.getRoleId())) {
                        roleCode = knownRole.getCode();
                    } else {
                        roleCode = roleRepo.findById(e.getRoleId())
                                .map(CatRoleJpaEntity::getCode).orElse(null);
                    }
                    return new CatalogRoleActivityDTO(
                            e.getId(), e.getRoleId(), roleCode,
                            e.getCode(), e.getActivity(), e.getDescription());
                })
                .collect(Collectors.toList());
    }

    private CatalogRoleActivityDTO toDTO(CatRoleActivityJpaEntity e) {
        String roleCode = roleRepo.findById(e.getRoleId())
                .map(CatRoleJpaEntity::getCode).orElse(null);
        return new CatalogRoleActivityDTO(
                e.getId(), e.getRoleId(), roleCode,
                e.getCode(), e.getActivity(), e.getDescription());
    }
}