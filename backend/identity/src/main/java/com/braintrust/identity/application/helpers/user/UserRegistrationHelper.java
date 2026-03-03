package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.CompleteUserDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Helper de registro actualizado.
 *
 * NUEVO: registerUserForExistingPerson
 * Permite asociar un nuevo usuario (cuenta) a una persona ya existente
 * siempre y cuando el rol sea DIFERENTE al que ya tiene.
 *
 * Ejemplo: Una persona puede tener cuenta TEACHER y cuenta STUDENT,
 *          pero NO dos cuentas TEACHER.
 */
@Component
public class UserRegistrationHelper {

    private static final Logger log = LoggerFactory.getLogger(UserRegistrationHelper.class);

    private final UserRepository   userRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder  passwordEncoder;

    public UserRegistrationHelper(UserRepository userRepository,
                                  PersonRepository personRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository   = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder  = passwordEncoder;
    }

    // ── Nuevo: crear usuario para persona EXISTENTE ───────────────────────────

    /**
     * Registra un nuevo usuario para una persona ya existente.
     * Valida que la persona no tenga ya un usuario con el mismo rol.
     *
     * @param personId ID de la persona existente
     * @param email    email del nuevo usuario
     * @param password contraseña del nuevo usuario
     * @param role     rol del nuevo usuario (debe ser distinto a los que ya tiene)
     * @param studentId solo requerido si role = STUDENT
     * @return UserId del nuevo usuario
     */
    @Transactional
    public UserId registerUserForExistingPerson(
            PersonId personId,
            String email,
            String password,
            Role role,
            String studentId) {

        log.info("🔗 Registering new {} account for existing Person ID: {}", role, personId.getValue());

        // 1. Verificar que la persona existe
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException(
                        "Persona no encontrada: " + personId.getValue()));

        // 2. Verificar email único
        Email emailVO = new Email(email);
        validateEmailNotExists(emailVO);

        // 3. Verificar que la persona NO tiene ya un usuario con este rol
        //    ✅ FIX: usar findAllByPersonId (retorna List<User>) en lugar de findByPersonId (retorna Optional<User>)
        List<User> existingUsers = userRepository.findAllByPersonId(personId);
        boolean alreadyHasRole = existingUsers.stream()
                .anyMatch(u -> u.getRole() == role);
        if (alreadyHasRole) {
            throw new IllegalStateException(
                    "La persona ya tiene una cuenta de tipo " + role.name() +
                            ". Una persona puede tener máximo un usuario por tipo de rol.");
        }

        // 4. Crear el usuario según el rol
        Password passwordVO = Password.create(password, passwordEncoder);
        User user = switch (role) {
            case TEACHER -> User.createTeacher(person, emailVO, passwordVO);
            case STUDENT -> User.createStudent(person, emailVO, passwordVO,
                    studentId != null && !studentId.isBlank() ? studentId : generateStudentId());
            case ADMIN   -> User.createAdmin(person, emailVO, passwordVO);
        };

        User saved = userRepository.save(user);
        log.info("✅ New {} account created. User ID: {}", role, saved.getId().getValue());
        return saved.getId();
    }


    // ── Métodos originales (sin cambios funcionales) ──────────────────────────

    @Transactional
    public UserId registerTeacher(RegisterTeacherCommand command) {
        Email email = new Email(command.email());
        validateEmailNotExists(email);
        Person person = createPersonWithInfo(command.firstName(), command.lastName(),
                command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);
        Password password = Password.create(command.password(), passwordEncoder);
        User teacher = User.createTeacher(savedPerson, email, password);
        return userRepository.save(teacher).getId();
    }

    @Transactional
    public UserId registerStudent(RegisterStudentCommand command) {
        Email email = new Email(command.email());
        validateEmailNotExists(email);
        Person person = createPersonWithInfo(command.firstName(), command.lastName(),
                command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);
        Password password = Password.create(command.password(), passwordEncoder);
        User student = User.createStudent(savedPerson, email, password, command.studentId());
        return userRepository.save(student).getId();
    }

    @Transactional
    public UserId registerAdmin(RegisterAdminCommand command) {
        Email email = new Email(command.email());
        validateEmailNotExists(email);
        Person person = createPersonWithInfo(command.firstName(), command.lastName(),
                command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);
        Password password = Password.create(command.password(), passwordEncoder);
        User admin = User.createAdmin(savedPerson, email, password);
        return userRepository.save(admin).getId();
    }

    @Transactional
    public CompleteUserDTO createCompleteUser(CreateCompleteUserCommand command) {
        Email email = new Email(command.email());
        validateEmailNotExists(email);
        Person person = createPersonWithAddress(command);
        Person savedPerson = personRepository.save(person);
        Password password = Password.create(command.password(), passwordEncoder);
        User user = createUserByRole(command, savedPerson, email, password);
        User savedUser = userRepository.save(user);
        return buildCompleteUserDTO(savedUser, savedPerson);
    }

    public boolean isEmailAvailable(Email email) {
        return !userRepository.existsByEmail(email);
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private void validateEmailNotExists(Email email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email ya registrado: " + email.getValue());
        }
    }

    private Person createPersonWithInfo(String firstName, String lastName, String gender, String phone) {
        Person person = Person.create(firstName, lastName);
        person.updatePersonalInfo(firstName, null, lastName, null, gender, phone);
        return person;
    }

    private Person createPersonWithAddress(CreateCompleteUserCommand command) {
        Person person = createPersonWithInfo(command.firstName(), command.lastName(),
                command.gender(), command.phone());
        if (hasAddressInformation(command)) {
            person.updateAddress(new Address(command.addressStreet(), command.addressColony(),
                    command.addressMunicipality(), command.addressState(), command.addressPostalCode()));
        }
        return person;
    }

    private User createUserByRole(CreateCompleteUserCommand command, Person person,
                                  Email email, Password password) {
        return switch (command.role()) {
            case STUDENT -> {
                String sid = command.userId();
                if (sid == null || sid.isBlank()) sid = generateStudentId();
                yield User.createStudent(person, email, password, sid);
            }
            case TEACHER -> User.createTeacher(person, email, password);
            case ADMIN   -> User.createAdmin(person, email, password);
        };
    }

    private String generateStudentId() {
        return "STUDED-" + java.util.UUID.randomUUID().toString().toUpperCase().substring(0, 8);
    }

    private CompleteUserDTO buildCompleteUserDTO(User user, Person person) {
        AddressDTO addressDTO = person.getAddress() != null
                ? new AddressDTO(person.getAddress().getStreet(), person.getAddress().getColony(),
                person.getAddress().getMunicipality(), person.getAddress().getState(),
                person.getAddress().getPostalCode())
                : null;

        return new CompleteUserDTO(
                user.getId().getValue(),
                person.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                person.getPrimerNombre(),
                person.getApellidoPaterno(),
                person.getGender(),
                person.getPhone(),
                person.getFullName(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO,
                user.getCreatedAt().toString(),
                user.getRole().name().toLowerCase() + " created successfully"
        );
    }

    private boolean hasAddressInformation(CreateCompleteUserCommand command) {
        return command.addressStreet() != null && !command.addressStreet().isBlank()
                && command.addressState() != null && !command.addressState().isBlank();
    }
}