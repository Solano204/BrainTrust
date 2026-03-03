package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.PersonSummaryDTO;
import com.braintrust.identity.application.ports.in.PersonService;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.PersonHasLinkedUserException;
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

/**
 * Servicio de aplicación para Personas.
 *
 * Reglas implementadas:
 * 1. Una persona puede existir sin usuario (tablas independientes).
 * 2. Al crear con CURP → birth_date y age se calculan automáticamente.
 * 3. CURP y RFC no se pueden modificar una vez registrados.
 * 4. Solo se puede eliminar una persona si NO tiene usuario vinculado.
 * 5. Rango de edad: 10–90 años (validado en el dominio).
 */
@Service
@Transactional
public class PersonApplicationService implements PersonService {

    private static final Logger log = LoggerFactory.getLogger(PersonApplicationService.class);

    private final PersonRepository personRepository;
    private final UserRepository   userRepository;

    public PersonApplicationService(PersonRepository personRepository,
                                    UserRepository userRepository) {
        this.personRepository = personRepository;
        this.userRepository   = userRepository;
        log.info("✅ PersonApplicationService initialized");
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonSummaryDTO> getAllPersonsSummary() {
        return personRepository.findAll().stream()
                .map(p -> new PersonSummaryDTO(
                        p.getId().getValue(),
                        p.getFullName(),
                        userRepository.existsByPersonId(p.getId())
                ))
                .collect(Collectors.toList());
    }


    // ── Crear persona ────────────────────────────────────────────────────────

    @Override
    public PersonId createPerson(CreatePersonCommand command) {
        log.info("🆕 Creating new Person: {} {}", command.primerNombre(), command.apellidoPaterno());
        try {
            Person person;

            if (command.curp() != null && !command.curp().isBlank()) {
                person = Person.createFull(
                        command.primerNombre(),
                        command.segundoNombre(),
                        command.apellidoPaterno(),
                        command.apellidoMaterno(),
                        command.curp(),
                        command.rfc()
                );
            } else {
                person = Person.create(command.primerNombre(), command.apellidoPaterno());
                if (command.rfc() != null && !command.rfc().isBlank()) {
                    person.assignRfc(command.rfc());
                }
            }

            person.updatePersonalInfo(
                    command.primerNombre(),
                    command.segundoNombre(),
                    command.apellidoPaterno(),
                    command.apellidoMaterno(),
                    command.gender(),
                    command.phone()
            );

            // ── Dirección opcional ────────────────────────────────────────────────
            if (command.hasAddress()) {
                person.updateAddress(new Address(
                        command.street(),
                        command.colony(),
                        command.municipality(),
                        command.state(),
                        command.postalCode()
                ));
            }

            Person saved = personRepository.save(person);
            log.info("✅ Person {} created successfully.", saved.getId().getValue());
            return saved.getId();

        } catch (Exception e) {
            log.error("❌ Failed to create person: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create person: " + e.getMessage(), e);
        }
    }

    // ── Actualizar información (sin CURP ni RFC) ─────────────────────────────

    @Override
    public void updatePersonalInfo(UpdatePersonInfoCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        log.warn("🔐 Updating PII for Person ID: {}", personId.getValue());

        try {
            Person person = findPersonByIdOrThrow(personId);

            // CURP y RFC no se pueden modificar → no están en el comando
            person.updatePersonalInfo(
                    command.primerNombre(),
                    command.segundoNombre(),
                    command.apellidoPaterno(),
                    command.apellidoMaterno(),
                    command.gender(),
                    command.phone()
            );

            personRepository.save(person);
            log.info("✅ PII updated for Person {}", personId.getValue());

        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to update PII for Person {}: {}", personId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to update personal info", e);
        }
    }

    // ── Eliminar persona ─────────────────────────────────────────────────────

    /**
     * Elimina una persona.
     * Regla: Solo se puede eliminar si NO tiene usuarios vinculados.
     * El llamador (controller) debe solicitar confirmación al usuario antes de llamar este método.
     *
     * @throws PersonHasLinkedUserException si la persona tiene al menos un usuario vinculado.
     */
    @Transactional
    public void deletePerson(PersonId personId) {
        log.warn("🗑️ Delete request for Person ID: {}", personId.getValue());

        Person person = findPersonByIdOrThrow(personId);

        // Validar que no tenga usuarios vinculados
        boolean hasUsers = userRepository.existsByPersonId(personId);
        if (hasUsers) {
            log.warn("❌ Cannot delete Person {} — has linked users.", personId.getValue());
            throw new PersonHasLinkedUserException(
                    "No se puede eliminar la persona porque tiene una cuenta de usuario vinculada. " +
                            "Elimine primero el o los usuarios asociados."
            );
        }

        personRepository.delete(person);
        log.info("✅ Person {} deleted successfully.", personId.getValue());
    }

    // ── Dirección e imagen ────────────────────────────────────────────────────

    @Override
    public void updateAddress(UpdatePersonAddressCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        try {
            Person person = findPersonByIdOrThrow(personId);
            Address address = new Address(
                    command.street(), command.colony(),
                    command.municipality(), command.state(), command.postalCode());
            person.updateAddress(address);
            personRepository.save(person);
            log.info("✅ Address updated for Person {}", personId.getValue());
        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update address", e);
        }
    }

    @Override
    public void updateImage(UpdateImageCommand command) {
        PersonId personId = PersonId.fromString(command.personId());
        try {
            Person person = findPersonByIdOrThrow(personId);
            person.updateImage(command.imagePath());
            personRepository.save(person);
        } catch (PersonNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update image", e);
        }
    }

    // ── Consultas ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonById(PersonId personId) {
        Person person = findPersonByIdOrThrow(personId);
        boolean tieneUsuario = userRepository.existsByPersonId(personId);
        return mapToPersonDTO(person, tieneUsuario);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonByUserId(UserId userId) {
        throw new UnsupportedOperationException(
                "Use UserService.getUserById — this method violates bounded context separation");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PersonDTO> getAllPersons(Pageable pageable) {
        Page<Person> personPage = personRepository.findAll(pageable);
        List<PersonDTO> dtos = personPage.getContent().stream()
                .map(p -> {
                    boolean tieneUsuario = userRepository.existsByPersonId(p.getId());
                    return mapToPersonDTO(p, tieneUsuario);
                })
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, personPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<PersonDTO> searchPersonsByName(String name, Pageable pageable) {
        Page<Person> allPersonsPage = personRepository.findAll(pageable);
        List<PersonDTO> filtered = allPersonsPage.getContent().stream()
                .filter(p -> matchesName(p, name))
                .map(p -> {
                    boolean tieneUsuario = userRepository.existsByPersonId(p.getId());
                    return mapToPersonDTO(p, tieneUsuario);
                })
                .collect(Collectors.toList());
        return new PageImpl<>(filtered, pageable, allPersonsPage.getTotalElements());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Person findPersonByIdOrThrow(PersonId personId) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException(
                        "Person not found: " + personId.getValue()));
    }

    private boolean matchesName(Person person, String query) {
        String q = query.toLowerCase();
        return person.getFullName().toLowerCase().contains(q)
                || person.getPrimerNombre().toLowerCase().contains(q)
                || person.getApellidoPaterno().toLowerCase().contains(q)
                || (person.getSegundoNombre()  != null && person.getSegundoNombre().toLowerCase().contains(q))
                || (person.getApellidoMaterno() != null && person.getApellidoMaterno().toLowerCase().contains(q));
    }

    private PersonDTO mapToPersonDTO(Person person, boolean tieneUsuario) {
        AddressDTO addressDTO = person.getAddress() != null
                ? new AddressDTO(
                person.getAddress().getStreet(),
                person.getAddress().getColony(),
                person.getAddress().getMunicipality(),
                person.getAddress().getState(),
                person.getAddress().getPostalCode())
                : null;

        return new PersonDTO(
                person.getId().getValue(),
                person.getCurp(),
                person.getRfc(),
                person.getPrimerNombre(),
                person.getSegundoNombre(),
                person.getApellidoPaterno(),
                person.getApellidoMaterno(),
                person.getFullName(),
                person.getGender(),
                person.getPhone(),
                person.getBirthDate() != null ? person.getBirthDate().toString() : null,
                person.getAge(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO,
                tieneUsuario
        );
    }
}