package com.braintrust.containerapp.rest.identity;

import com.braintrust.identity.application.dtos.commands.CreatePersonCommand;
import com.braintrust.identity.application.dtos.commands.UpdateImageCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonAddressCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonInfoCommand;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// other imports...

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

//
//    /*delete */
//    @PostMapping
//    public ResponseEntity<SuccessResponseDTO> createPerson(@RequestBody CreatePersonCommand command) {
//        log.info("Request received to create new person: {} {}", command.firstName(), command.lastName());
//        PersonId personId = personService.createPerson(command);
//        log.info("Person created successfully with ID: {}", personId.getValue());
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(new SuccessResponseDTO(true, "Person created successfully", personId.getValue()));
//    }



//    /*delete */
//    @PutMapping("/personal-info")
//    public ResponseEntity<SuccessResponseDTO> updatePersonInfo(@RequestBody UpdatePersonInfoCommand command) {
//        log.info("Updating personal info for Person ID: {}", command.personId());
//        personService.updatePersonalInfo(command);
//        log.debug("Person ID {} information updated.", command.personId());
//        return ResponseEntity.ok(new SuccessResponseDTO(true, "Person information updated successfully", null));
//    }

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


//
//    // delete
//    @GetMapping("/{personId}")
//    public ResponseEntity<PersonDTO> getPersonById(@PathVariable String personId) {
//        log.debug("Fetching details for Person ID: {}", personId);
//        PersonDTO person = personService.getPersonById(PersonId.fromString(personId));
//        return ResponseEntity.ok(person);
//    }

    @GetMapping
    public ResponseEntity<List<PersonDTO>> getAllPersons() {
        log.debug("Fetching list of all persons.");
        List<PersonDTO> persons = personService.getAllPersons();
        return ResponseEntity.ok(persons);
    }
}