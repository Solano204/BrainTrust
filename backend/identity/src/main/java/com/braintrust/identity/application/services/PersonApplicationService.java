// 📍 identity/application/services/PersonApplicationService.java
package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.CreatePersonCommand;
import com.braintrust.identity.application.dtos.commands.UpdateImageCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonAddressCommand;
import com.braintrust.identity.application.dtos.commands.UpdatePersonInfoCommand;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j // ⬅️ Enable the 'log' variable
public class PersonApplicationService implements PersonService {

    private final PersonRepository personRepository;

    public PersonApplicationService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    @Override
    public PersonId createPerson(CreatePersonCommand command) {
        log.info("Creating new Person for: {} {}", command.firstName(), command.lastName());

        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        Person savedPerson = personRepository.save(person);
        log.info("Person record created and saved. ID: {}", savedPerson.getId().getValue());
        return savedPerson.getId();
    }



    @Override
    public void updatePersonalInfo(UpdatePersonInfoCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        log.warn("Updating sensitive PII for Person ID: {}", personId.getValue()); // PII update is high-level event

        Person person = findPersonByIdOrThrow(personId);

        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        personRepository.save(person);
        log.debug("PII updated successfully for Person ID {}.", personId.getValue());
    }

    @Override
    public void updateAddress(UpdatePersonAddressCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        log.info("Updating address for Person ID: {}", personId.getValue());

        Person person = findPersonByIdOrThrow(personId);

        Address address = new Address(
                command.street(),
                command.colony(),
                command.municipality(),
                command.state(),
                command.postalCode()
        );

        person.updateAddress(address);
        personRepository.save(person);
        log.debug("Address updated for Person ID {}.", personId.getValue());
    }

    @Override
    public void updateImage(UpdateImageCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        log.info("Updating profile image for Person ID: {}", personId.getValue());

        Person person = findPersonByIdOrThrow(personId);
        person.updateImage(command.imagePath());
        personRepository.save(person);
        log.debug("Image path updated for Person ID {}.", personId.getValue());
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonById(PersonId personId) {
        log.debug("Fetching DTO for Person ID: {}", personId.getValue());
        Person person = findPersonByIdOrThrow(personId);
        return mapToPersonDTO(person);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonByUserId(UserId userId) {
        log.error("Method 'getPersonByUserId' invoked, but is UNUSABLE. Use UserService.");
        throw new UnsupportedOperationException("Use UserService.getUserById instead");
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonDTO> getAllPersons() {
        log.debug("Fetching list of all person records.");
        List<Person> persons = personRepository.findAll();
        return persons.stream()
                .map(this::mapToPersonDTO)
                .collect(Collectors.toList());
    }

    private Person findPersonByIdOrThrow(PersonId personId) {
        log.trace("Attempting to retrieve Person ID: {}", personId.getValue());
        return personRepository.findById(personId)
                .orElseThrow(() -> {
                    log.warn("Person not found with ID: {}", personId.getValue());
                    return new PersonNotFoundException("Person not found: " + personId.getValue());
                });
    }

    private PersonDTO mapToPersonDTO(Person person) {
        // Mapping logic (no logging required here)
        AddressDTO addressDTO = person.getAddress() != null
                ? new AddressDTO(
                person.getAddress().getStreet(),
                person.getAddress().getColony(),
                person.getAddress().getMunicipality(),
                person.getAddress().getState(),
                person.getAddress().getPostalCode()
        )
                : null;

        return new PersonDTO(
                person.getId().getValue(),
                person.getFirstName(),
                person.getLastName(),
                person.getFullName(),
                person.getGender(),
                person.getPhone(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO
        );
    }
}