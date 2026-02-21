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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PersonApplicationService implements PersonService {

    private final PersonRepository personRepository;
    private static final Logger log =
            LoggerFactory.getLogger(PersonApplicationService.class);
    public PersonApplicationService(PersonRepository personRepository) {
        this.personRepository = personRepository;
        log.info("✅ PersonApplicationService initialized with Virtual Threads support");
    }


    @Transactional(readOnly = true)
    public Page<PersonDTO> searchPersonsByName(String name, Pageable pageable) {
        log.debug("🔍 Searching persons by name: '{}' with pagination", name);

        try {
            Page<Person> allPersonsPage = personRepository.findAll(pageable);

            List<PersonDTO> filteredPersons = allPersonsPage.getContent().stream()
                    .filter(person ->
                            person.getFullName().toLowerCase().contains(name.toLowerCase()) ||
                                    person.getFirstName().toLowerCase().contains(name.toLowerCase()) ||
                                    person.getLastName().toLowerCase().contains(name.toLowerCase())
                    )
                    .map(this::mapToPersonDTO)
                    .collect(Collectors.toList());

            return new PageImpl<>(filteredPersons, pageable, allPersonsPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to search persons by name: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search persons", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<PersonDTO> findPersonsByNameContaining(String name, Pageable pageable) {
        log.debug("🔍 Finding persons by name containing: '{}'", name);


        return searchPersonsByName(name, pageable);
    }


    @Override
    public PersonId createPerson(CreatePersonCommand command) {
        long startTime = System.currentTimeMillis();

        log.info("🆕 Creating new Person: {} {}", command.firstName(), command.lastName());

        try {

            Person person = Person.create(command.firstName(), command.lastName());

            person.updatePersonalInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );

            Person savedPerson = personRepository.save(person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Person {} created in {}ms", savedPerson.getId().getValue(), duration);

            return savedPerson.getId();

        } catch (Exception e) {
            log.error("❌ Failed to create person {}: {}",
                    command.firstName(), e.getMessage(), e);
            throw new RuntimeException("Failed to create person", e);
        }
    }

    @Override
    public void updatePersonalInfo(UpdatePersonInfoCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        long startTime = System.currentTimeMillis();

        log.warn("🔐 Updating PII for Person ID: {}", personId.getValue());

        try {
            Person person = findPersonByIdOrThrow(personId);

            person.updatePersonalInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );

            personRepository.save(person);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ PII updated for Person {} in {}ms", personId.getValue(), duration);

        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to update PII for Person {}: {}",
                    personId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to update personal info", e);
        }
    }

    @Override
    public void updateAddress(UpdatePersonAddressCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        long startTime = System.currentTimeMillis();

        log.info("📍 Updating address for Person ID: {}", personId.getValue());

        try {
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

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Address updated for Person {} in {}ms",
                    personId.getValue(), duration);

        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to update address for Person {}: {}",
                    personId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to update address", e);
        }
    }

    @Override
    public void updateImage(UpdateImageCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        long startTime = System.currentTimeMillis();

        log.info("🖼️ Updating profile image for Person ID: {}", personId.getValue());

        try {
            Person person = findPersonByIdOrThrow(personId);
            person.updateImage(command.imagePath());
            personRepository.save(person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Image updated for Person {} in {}ms",
                    personId.getValue(), duration);

        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to update image for Person {}: {}",
                    personId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to update image", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonById(PersonId personId) {
        log.debug("📊 Fetching Person DTO by ID: {}", personId.getValue());
        Person person = findPersonByIdOrThrow(personId);
        return mapToPersonDTO(person);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonByUserId(UserId userId) {
        log.error("❌ Method 'getPersonByUserId' is DEPRECATED - Use UserService instead");
        throw new UnsupportedOperationException(
                "Use UserService.getUserById instead - this method violates bounded context separation"
        );
    }


    @Override
    @Transactional(readOnly = true)
    public Page<PersonDTO> getAllPersons(Pageable pageable) {
        log.debug("📊 Fetching paginated persons. Page: {}, Size: {}, Sort: {}",
                pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());
        long startTime = System.currentTimeMillis();

        try {
            Page<Person> personPage = personRepository.findAll(pageable);

            List<PersonDTO> dtos = personPage.getContent().stream()
                    .map(this::mapToPersonDTO)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} persons (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(),
                    personPage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, personPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated persons: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated persons", e);
        }
    }

    private Person findPersonByIdOrThrow(PersonId personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> {
                    log.warn("❌ Person not found with ID: {}", personId.getValue());
                    return new PersonNotFoundException(
                            "Person not found: " + personId.getValue()
                    );
                });
    }

    private PersonDTO mapToPersonDTO(Person person) {
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