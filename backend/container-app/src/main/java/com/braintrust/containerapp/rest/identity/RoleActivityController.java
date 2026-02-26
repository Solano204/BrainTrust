package com.braintrust.containerapp.rest.identity;

import com.braintrust.identity.application.dtos.dtos.catalog.*;
import com.braintrust.identity.application.services.RoleActivityService;
import com.braintrust.identity.domain.exceptions.CatalogInUseException;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "*")
@Tag(name = "Role & Activity Management", description = "CRUD for roles (cat_roles) and role activities (cat_role_activities)")
public class RoleActivityController {

    private static final Logger log = LoggerFactory.getLogger(RoleActivityController.class);
    private final RoleActivityService roleActivityService;

    public RoleActivityController(RoleActivityService roleActivityService) {
        this.roleActivityService = roleActivityService;
    }

    // ==================== ROLES ====================

    @GetMapping("/roles")
    @Operation(summary = "Get paginated roles")
    public ResponseEntity<PagedResponseDTO<CatRoleDTO>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(roleActivityService.getAllRoles(page, size));
    }

    @GetMapping("/roles/all")
    @Operation(summary = "Get all roles (no pagination - for dropdowns)")
    public ResponseEntity<List<CatRoleDTO>> getAllRolesList() {
        return ResponseEntity.ok(roleActivityService.getAllRolesList());
    }

    @GetMapping("/roles/{id}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<?> getRoleById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(roleActivityService.getRoleById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @PostMapping("/roles")
    @Operation(summary = "Create a new role")
    public ResponseEntity<?> createRole(@RequestBody CatRoleRequest request) {
        try {
            CatRoleDTO result = roleActivityService.createRole(request.code(), request.description());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @PutMapping("/roles/{id}")
    @Operation(summary = "Update a role")
    public ResponseEntity<?> updateRole(@PathVariable Integer id, @RequestBody CatRoleRequest request) {
        try {
            return ResponseEntity.ok(roleActivityService.updateRole(id, request.code(), request.description()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/roles/{id}")
    @Operation(summary = "Delete a role (only if no users are assigned to it)")
    public ResponseEntity<?> deleteRole(@PathVariable Integer id) {
        try {
            roleActivityService.deleteRole(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Role deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    // ==================== ROLE ACTIVITIES ====================

    @GetMapping("/role-activities")
    @Operation(summary = "Get paginated role activities (all roles)")
    public ResponseEntity<PagedResponseDTO<CatalogRoleActivityDTO>> getAllActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(roleActivityService.getAllActivities(page, size));
    }

    @GetMapping("/role-activities/by-role/{roleId}")
    @Operation(summary = "Get paginated activities for a specific role")
    public ResponseEntity<?> getActivitiesByRole(
            @PathVariable Integer roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            return ResponseEntity.ok(roleActivityService.getActivitiesByRole(roleId, page, size));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @GetMapping("/role-activities/{id}")
    @Operation(summary = "Get a role activity by ID")
    public ResponseEntity<?> getActivityById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(roleActivityService.getActivityById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @PostMapping("/role-activities")
    @Operation(summary = "Create a new role activity")
    public ResponseEntity<?> createActivity(@RequestBody CatalogRoleActivityRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(roleActivityService.createActivity(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @PutMapping("/role-activities/{id}")
    @Operation(summary = "Update a role activity")
    public ResponseEntity<?> updateActivity(
            @PathVariable Integer id, @RequestBody CatalogRoleActivityRequest request) {
        try {
            return ResponseEntity.ok(roleActivityService.updateActivity(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/role-activities/{id}")
    @Operation(summary = "Delete a role activity")
    public ResponseEntity<?> deleteActivity(@PathVariable Integer id) {
        try {
            roleActivityService.deleteActivity(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Activity deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }
}