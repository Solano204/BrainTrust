package com.braintrust.identity.infraestructure.rest;


import com.braintrust.identity.application.dtos.*;
import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "*")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createPerson(@RequestBody CreatePersonCommand command) {
        PersonId personId = personService.createPerson(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Person created successfully", personId.getValue()));
    }

    @PutMapping("/personal-info")  // More explicit than "/info"
    public ResponseEntity<SuccessResponseDTO> updatePersonInfo(@RequestBody UpdatePersonInfoCommand command) {
        personService.updatePersonalInfo(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Person information updated successfully", null));
    }

    @PutMapping("/contact-address")  // More explicit than "/address"
    public ResponseEntity<SuccessResponseDTO> updateAddress(@RequestBody UpdatePersonAddressCommand command) {

        personService.updateAddress(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Address updated successfully", null));
    }

    @PutMapping("/profile-image")  // More explicit than "/image"
    public ResponseEntity<SuccessResponseDTO> updateImage(@RequestBody UpdateImageCommand command) {
        personService.updateImage(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Image updated successfully", null));
    }

    @GetMapping("/{personId}")
    public ResponseEntity<PersonDTO> getPersonById(@PathVariable String personId) {
        PersonDTO person = personService.getPersonById(PersonId.fromString(personId));
        return ResponseEntity.ok(person);
    }

    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        List<PersonDTO> persons = personService.getAllPersons();
        return ResponseEntity.ok(persons);
    }
}