package com.braintrust.containerapp.rest.identity;

import com.braintrust.education.application.dtos.dtos.PaginatedResponse;
import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.PersonSummaryDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.application.services.PersonApplicationService;
import com.braintrust.identity.domain.exceptions.PersonHasLinkedUserException;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de personas.
 *
 * Cambios:
 * - POST /api/persons → crear persona (independiente de usuario)
 * - PUT  /api/persons/personal-info → actualizar (sin CURP ni RFC)
 * - DELETE /api/persons/{personId} → solo si NO tiene usuario vinculado
 * - GET /api/persons/{personId} → incluye tieneUsuario flag
 * - CURP y RFC no pueden modificarse (no están en UpdatePersonInfoCommand)
 */
@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "*")
public class PersonController {

    private static final Logger log = LoggerFactory.getLogger(PersonController.class);

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    // ── Crear persona ────────────────────────────────────────────────────────

    @Operation(
            summary = "Crear persona",
            description = "Crea una persona. Puede existir sin usuario. Si se provee CURP, " +
                    "la fecha de nacimiento y edad se calculan automáticamente. Rango: 10–90 años."
    )
    @ApiResponse(responseCode = "201", description = "Persona creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o CURP fuera de rango")
    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createPerson(@RequestBody @Valid CreatePersonCommand command) {
        log.info("🆕 Creating person: {} {}", command.primerNombre(), command.apellidoPaterno());
        PersonId personId = ((PersonApplicationService) personService).createPerson(command);
        log.info("✅ Person created: {}", personId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Persona creada exitosamente", personId.getValue()));
    }

    // ── Actualizar información personal ──────────────────────────────────────

    @Operation(
            summary = "Actualizar datos personales",
            description = "Actualiza nombre, apellidos, género y teléfono. CURP y RFC NO pueden modificarse."
    )
    @ApiResponse(responseCode = "200", description = "Datos actualizados")
    @ApiResponse(responseCode = "404", description = "Persona no encontrada")
    @PutMapping("/personal-info")
    public ResponseEntity<SuccessResponseDTO> updatePersonalInfo(
            @RequestBody @Valid UpdatePersonInfoCommand command) {
        log.info("🔐 Updating personal info for Person ID: {}", command.personId());
        ((PersonApplicationService) personService).updatePersonalInfo(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Datos personales actualizados", null));
    }

    // ── Eliminar persona ─────────────────────────────────────────────────────

    @Operation(
            summary = "Eliminar persona",
            description = "Elimina una persona. Solo permitido si NO tiene usuario vinculado. " +
                    "Si tiene usuario vinculado, retorna 409 Conflict con mensaje de error. " +
                    "Se recomienda mostrar confirmación al usuario antes de llamar este endpoint."
    )
    @ApiResponse(responseCode = "200", description = "Persona eliminada exitosamente")
    @ApiResponse(responseCode = "404", description = "Persona no encontrada")
    @ApiResponse(responseCode = "409", description = "La persona tiene un usuario vinculado y no puede eliminarse")
    @Parameter(name = "personId", description = "ID de la persona a eliminar", required = true)
    @DeleteMapping("/{personId}")
    public ResponseEntity<SuccessResponseDTO> deletePerson(@PathVariable String personId) {
        log.warn("🗑️ Delete request for Person ID: {}", personId);
        try {
            ((PersonApplicationService) personService).deletePerson(PersonId.fromString(personId));
            log.info("✅ Person {} deleted.", personId);
            return ResponseEntity.ok(
                    new SuccessResponseDTO(true, "Persona eliminada exitosamente", null));
        } catch (PersonHasLinkedUserException e) {
            log.warn("❌ Cannot delete Person {} — has linked user.", personId);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new SuccessResponseDTO(false, e.getMessage(), null));
        }
    }

    // ── Consultar persona por ID ──────────────────────────────────────────────

    @Operation(summary = "Obtener persona por ID")
    @ApiResponse(responseCode = "200", description = "Datos de la persona")
    @ApiResponse(responseCode = "404", description = "Persona no encontrada")
    @GetMapping("/{personId}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable String personId) {
        PersonDTO dto = personService.getPersonById(PersonId.fromString(personId));
        return ResponseEntity.ok(dto);
    }

    // ── Listar personas (paginado) ─────────────────────────────────────────────

    @Operation(summary = "Listar personas (paginado)")
    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<PersonDTO>> getAllPersonsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "registrationDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<PersonDTO> personPage = personService.getAllPersons(pageable);
        return ResponseEntity.ok(PaginatedResponse.fromPage(personPage));
    }

    // ── Buscar por nombre ─────────────────────────────────────────────────────

    @Operation(summary = "Buscar personas por nombre")
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<PersonDTO>> searchPersonsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PersonDTO> personPage = ((PersonApplicationService) personService)
                .searchPersonsByName(name, pageable);
        return ResponseEntity.ok(PaginatedResponse.fromPage(personPage));
    }

    // ── Listar todas (legacy) ─────────────────────────────────────────────────

    @Operation(summary = "Listar todas las personas (legacy)")
    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("registrationDate").descending());
        return ResponseEntity.ok(personService.getAllPersons(pageable).getContent());
    }


    @Operation(
            summary = "Listar personas (resumen para selector)",
            description = "Retorna id y nombre completo de todas las personas. " +
                    "Útil para seleccionar una persona al crear un usuario vinculado."
    )
    @GetMapping("/summary")
    public ResponseEntity<List<PersonSummaryDTO>> getAllPersonsSummary() {
        List<PersonSummaryDTO> summary = ((PersonApplicationService) personService).getAllPersonsSummary();
        return ResponseEntity.ok(summary);
    }
    // ── Actualizar dirección ──────────────────────────────────────────────────

    @PutMapping("/contact-address")
    public ResponseEntity<SuccessResponseDTO> updateAddress(
            @RequestBody UpdatePersonAddressCommand command) {
        personService.updateAddress(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Dirección actualizada", null));
    }

    // ── Actualizar imagen ─────────────────────────────────────────────────────

    @PutMapping("/profile-image")
    public ResponseEntity<SuccessResponseDTO> updateImage(
            @RequestBody UpdateImageCommand command) {
        personService.updateImage(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Imagen actualizada", null));
    }
}