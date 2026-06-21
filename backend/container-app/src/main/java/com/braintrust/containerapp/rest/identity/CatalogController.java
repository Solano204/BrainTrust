package com.braintrust.containerapp.rest.identity;

import com.braintrust.identity.application.dtos.dtos.catalog.*;
import com.braintrust.identity.application.services.CatalogService;
import com.braintrust.identity.domain.exceptions.CatalogInUseException;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "*")
@Tag(name = "Catalog Management", description = "CRUD operations for all system catalogs (names, addresses, etc.)")
public class CatalogController {

    private static final Logger log = LoggerFactory.getLogger(CatalogController.class);
    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }


    @GetMapping("/first-names")
    @Operation(summary = "Get paginated first names (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogItemDTO>> getAllFirstNames(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")             @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Search term")           @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllFirstNames(page, size, search));
    }

    @PostMapping("/first-names")
    @Operation(summary = "Add a first name (reuses existing if already present)")
    public ResponseEntity<CatalogItemDTO> addFirstName(@RequestBody CatalogValueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.addFirstName(request.value()));
    }

    @PutMapping("/first-names/{id}")
    @Operation(summary = "Update a first name (only if no person uses it)")
    public ResponseEntity<?> updateFirstName(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateFirstName(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/first-names/{id}")
    @Operation(summary = "Delete a first name (only if no person uses it)")
    public ResponseEntity<?> deleteFirstName(@PathVariable Integer id) {
        try {
            catalogService.deleteFirstName(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "First name deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/last-names")
    @Operation(summary = "Get paginated last names (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogItemDTO>> getAllLastNames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllLastNames(page, size, search));
    }

    @PostMapping("/last-names")
    @Operation(summary = "Add a last name (reuses existing if already present)")
    public ResponseEntity<CatalogItemDTO> addLastName(@RequestBody CatalogValueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.addLastName(request.value()));
    }

    @PutMapping("/last-names/{id}")
    @Operation(summary = "Update a last name (only if no person uses it)")
    public ResponseEntity<?> updateLastName(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateLastName(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/last-names/{id}")
    @Operation(summary = "Delete a last name (only if no person uses it)")
    public ResponseEntity<?> deleteLastName(@PathVariable Integer id) {
        try {
            catalogService.deleteLastName(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Last name deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/states")
    @Operation(summary = "Get paginated states (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogItemDTO>> getAllStates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllStates(page, size, search));
    }

    @PostMapping("/states")
    @Operation(summary = "Add a state (reuses existing if already present)")
    public ResponseEntity<CatalogItemDTO> addState(@RequestBody CatalogValueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.addState(request.value()));
    }

    @PutMapping("/states/{id}")
    @Operation(summary = "Update a state (only if no dependency exists)")
    public ResponseEntity<?> updateState(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateState(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/states/{id}")
    @Operation(summary = "Delete a state (only if no dependency exists)")
    public ResponseEntity<?> deleteState(@PathVariable Integer id) {
        try {
            catalogService.deleteState(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "State deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/municipalities")
    @Operation(summary = "Get paginated municipalities (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogMunicipalityDTO>> getAllMunicipalities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllMunicipalities(page, size, search));
    }

    @GetMapping("/municipalities/by-state/{stateId}")
    @Operation(summary = "Get paginated municipalities by state")
    public ResponseEntity<PagedResponseDTO<CatalogMunicipalityDTO>> getMunicipalitiesByState(
            @PathVariable Integer stateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(catalogService.getMunicipalitiesByState(stateId, page, size));
    }

    @PostMapping("/municipalities")
    @Operation(summary = "Add a municipality (reuses existing if already present)")
    public ResponseEntity<CatalogMunicipalityDTO> addMunicipality(@RequestBody CatalogMunicipalityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalogService.addMunicipality(request.stateId(), request.municipalityName()));
    }

    @PutMapping("/municipalities/{id}")
    @Operation(summary = "Update a municipality (only if no dependency exists)")
    public ResponseEntity<?> updateMunicipality(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateMunicipality(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/municipalities/{id}")
    @Operation(summary = "Delete a municipality (only if no dependency exists)")
    public ResponseEntity<?> deleteMunicipality(@PathVariable Integer id) {
        try {
            catalogService.deleteMunicipality(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Municipality deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/colonies")
    @Operation(summary = "Get paginated colonies (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogColonyDTO>> getAllColonies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllColonies(page, size, search));
    }

    @GetMapping("/colonies/by-municipality/{municipalityId}")
    @Operation(summary = "Get paginated colonies by municipality")
    public ResponseEntity<PagedResponseDTO<CatalogColonyDTO>> getColoniesByMunicipality(
            @PathVariable Integer municipalityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(catalogService.getColoniesByMunicipality(municipalityId, page, size));
    }

    @PostMapping("/colonies")
    @Operation(summary = "Add a colony (reuses existing if already present)")
    public ResponseEntity<CatalogColonyDTO> addColony(@RequestBody CatalogColonyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalogService.addColony(request.municipalityId(), request.colonyName()));
    }

    @PutMapping("/colonies/{id}")
    @Operation(summary = "Update a colony (only if no dependency exists)")
    public ResponseEntity<?> updateColony(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateColony(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/colonies/{id}")
    @Operation(summary = "Delete a colony (only if no dependency exists)")
    public ResponseEntity<?> deleteColony(@PathVariable Integer id) {
        try {
            catalogService.deleteColony(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Colony deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/streets")
    @Operation(summary = "Get paginated streets (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogStreetDTO>> getAllStreets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllStreets(page, size, search));
    }

    @GetMapping("/streets/by-colony/{colonyId}")
    @Operation(summary = "Get paginated streets by colony")
    public ResponseEntity<PagedResponseDTO<CatalogStreetDTO>> getStreetsByColony(
            @PathVariable Integer colonyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(catalogService.getStreetsByColony(colonyId, page, size));
    }

    @PostMapping("/streets")
    @Operation(summary = "Add a street (reuses existing if already present)")
    public ResponseEntity<CatalogStreetDTO> addStreet(@RequestBody CatalogStreetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalogService.addStreet(request.colonyId(), request.streetName()));
    }

    @PutMapping("/streets/{id}")
    @Operation(summary = "Update a street (only if no person uses it)")
    public ResponseEntity<?> updateStreet(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updateStreet(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/streets/{id}")
    @Operation(summary = "Delete a street (only if no person uses it)")
    public ResponseEntity<?> deleteStreet(@PathVariable Integer id) {
        try {
            catalogService.deleteStreet(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Street deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }


    @GetMapping("/postal-codes")
    @Operation(summary = "Get paginated postal codes (optional search)")
    public ResponseEntity<PagedResponseDTO<CatalogPostalCodeDTO>> getAllPostalCodes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogService.getAllPostalCodes(page, size, search));
    }

    @GetMapping("/postal-codes/by-colony/{colonyId}")
    @Operation(summary = "Get paginated postal codes by colony")
    public ResponseEntity<PagedResponseDTO<CatalogPostalCodeDTO>> getPostalCodesByColony(
            @PathVariable Integer colonyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(catalogService.getPostalCodesByColony(colonyId, page, size));
    }

    @PostMapping("/postal-codes")
    @Operation(summary = "Add a postal code (reuses existing if already present)")
    public ResponseEntity<CatalogPostalCodeDTO> addPostalCode(@RequestBody CatalogPostalCodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(catalogService.addPostalCode(request.colonyId(), request.postalCode()));
    }

    @PutMapping("/postal-codes/{id}")
    @Operation(summary = "Update a postal code (only if no person uses it)")
    public ResponseEntity<?> updatePostalCode(@PathVariable Integer id, @RequestBody CatalogValueRequest request) {
        try {
            return ResponseEntity.ok(catalogService.updatePostalCode(id, request.value()));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/postal-codes/{id}")
    @Operation(summary = "Delete a postal code (only if no person uses it)")
    public ResponseEntity<?> deletePostalCode(@PathVariable Integer id) {
        try {
            catalogService.deletePostalCode(id);
            return ResponseEntity.ok(new SuccessResponseDTO(true, "Postal code deleted", null));
        } catch (CatalogInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }
}