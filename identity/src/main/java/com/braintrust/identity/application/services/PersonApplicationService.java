// 📍 identity/application/services/PersonApplicationService.java
package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.*;
import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PersonApplicationService implements PersonService {

    private final PersonRepository personRepository;

    public PersonApplicationService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    @Override
    public PersonId createPerson(CreatePersonCommand command) {
        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        Person savedPerson = personRepository.save(person);
        return savedPerson.getId();
    }



    @Override
    public void updatePersonalInfo(UpdatePersonInfoCommand command) {
        Person person = findPersonByIdOrThrow(PersonId.fromString(command.personId()));

        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        personRepository.save(person);
    }

    @Override
    public void updateAddress(UpdatePersonAddressCommand command) {
        Person person = findPersonByIdOrThrow(PersonId.fromString(String.valueOf(command.personId())));

        Address address = new Address(
                command.street(),
                command.colony(),
                command.municipality(),
                command.state(),
                command.postalCode()
        );

        person.updateAddress(address);
        personRepository.save(person);
    }

    @Override
    public void updateImage(UpdateImageCommand command) {
        Person person = findPersonByIdOrThrow(PersonId.fromString(command.personId()));
        person.updateImage(command.imagePath());
        personRepository.save(person);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonById(PersonId personId) {
        Person person = findPersonByIdOrThrow(personId);
        return mapToPersonDTO(person);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonByUserId(UserId userId) {
        // This would require UserRepository to find person
        throw new UnsupportedOperationException("Use UserService.getUserById instead");
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonDTO> getAllPersons() {
        List<Person> persons = personRepository.findAll();
        return persons.stream()
                .map(this::mapToPersonDTO)
                .collect(Collectors.toList());
    }

    private Person findPersonByIdOrThrow(PersonId personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person not found: " + personId.getValue()));
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