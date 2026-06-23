package com.braintrust.containerapp.rest.identity;

import com.braintrust.education.application.dtos.dtos.PaginatedResponse;
import com.braintrust.identity.application.dtos.commands.CreatePersonCommand;
import com.braintrust.identity.application.dtos.commands.UpdateImageCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonAddressCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonInfoCommand;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.application.services.PersonApplicationService;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "*")
public class PersonController {

    private static final Logger log =
            LoggerFactory.getLogger(PersonController.class);

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }


    @Operation(
            summary = "Get all persons with pagination",
            description = "Retrieves a paginated list of all persons. Supports sorting and filtering by page/size."
    )
    @ApiResponse(responseCode = "200", description = "Paginated persons retrieved successfully")
    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<PersonDTO>> getAllPersonsPaginated(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Number of items per page", example = "20")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort by field (e.g., 'firstName,asc' or 'registrationDate,desc')",
                    example = "registrationDate,desc")
            @RequestParam(defaultValue = "registrationDate,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<PersonDTO> personPage = personService.getAllPersons(pageable);

        PaginatedResponse<PersonDTO> response = PaginatedResponse.fromPage(personPage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search persons by name",
            description = "Searches persons by name (first name, last name, or full name) with pagination support."
    )
    @ApiResponse(responseCode = "200", description = "Persons found successfully")
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<PersonDTO>> searchPersonsByName(
            @Parameter(description = "Name to search for", required = true)
            @RequestParam String name,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName,asc") String sort) {

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        if (personService instanceof PersonApplicationService) {
            Page<PersonDTO> personPage = ((PersonApplicationService) personService)
                    .searchPersonsByName(name, pageable);
            PaginatedResponse<PersonDTO> response = PaginatedResponse.fromPage(personPage);
            return ResponseEntity.ok(response);
        } else {

            Page<PersonDTO> personPage = personService.getAllPersons(pageable);
            PaginatedResponse<PersonDTO> response = PaginatedResponse.fromPage(personPage);
            return ResponseEntity.ok(response);
        }
    }


    @PutMapping("/contact-address")
    public ResponseEntity<SuccessResponseDTO> updateAddress(@RequestBody UpdatePersonAddressCommand command) {
        log.info("Updating contact address for Person ID: {}", command.personId());
        personService.updateAddress(command);
        log.debug("Address updated for Person ID {}.", command.personId());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Address updated successfully", null));
    }

    @PutMapping("/profile-image")
    public ResponseEntity<SuccessResponseDTO> updateImage(@RequestBody UpdateImageCommand command) {
        log.info("Updating profile image for Person ID: {}", command.personId());
        personService.updateImage(command);
        log.debug("Image updated for Person ID {}.", command.personId());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Image updated successfully", null));
    }

    @Operation(
            summary = "Get all persons (legacy)",
            description = "Retrieves all persons without pagination. Use /paginated endpoint for better performance with large datasets."
    )
    @ApiResponse(responseCode = "200", description = "All persons retrieved")
    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {

        Pageable pageable = PageRequest.of(0, 1000, Sort.by("registrationDate").descending());
        Page<PersonDTO> personPage = personService.getAllPersons(pageable);
        return ResponseEntity.ok(personPage.getContent());
    }
}