package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.CompleteUserDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserRegistrationHelper {

    private static final Logger log = LoggerFactory.getLogger(UserRegistrationHelper.class);

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    public UserRegistrationHelper(
            UserRepository userRepository,
            PersonRepository personRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserId registerTeacher(RegisterTeacherCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        log.info("Registering teacher email={}", command.email());

        try {
            validateEmailNotExists(email);

            Person person = createPersonWithInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );
            Person savedPerson = personRepository.save(person);

            Password password = Password.create(command.password(), passwordEncoder);
            User teacher = User.createTeacher(savedPerson, email, password);
            User savedUser = userRepository.save(teacher);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Teacher registered durationMs={} userId={} personId={}",
                    duration, savedUser.getId().getValue(), savedPerson.getId().getValue());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to register teacher email={}: {}", command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register teacher", e);
        }
    }

    @Transactional
    public UserId registerStudent(RegisterStudentCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        log.info("Registering student email={}", command.email());

        try {
            validateEmailNotExists(email);

            Person person = createPersonWithInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );
            Person savedPerson = personRepository.save(person);

            Password password = Password.create(command.password(), passwordEncoder);
            User student = User.createStudent(savedPerson, email, password, command.studentId());
            User savedUser = userRepository.save(student);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Student registered durationMs={} userId={} studentRef={}",
                    duration, savedUser.getId().getValue(), command.studentId());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to register student email={}: {}", command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register student", e);
        }
    }

    @Transactional
    public UserId registerAdmin(RegisterAdminCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        log.warn("Registering admin email={}", command.email());

        try {
            validateEmailNotExists(email);

            Person person = createPersonWithInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );
            Person savedPerson = personRepository.save(person);

            Password password = Password.create(command.password(), passwordEncoder);
            User admin = User.createAdmin(savedPerson, email, password);
            User savedUser = userRepository.save(admin);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("Admin registered durationMs={} userId={}", duration, savedUser.getId().getValue());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to register admin email={}: {}", command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register admin", e);
        }
    }

    @Transactional
    public CompleteUserDTO createCompleteUser(CreateCompleteUserCommand command) {
        long startTime = System.currentTimeMillis();
        Email email = new Email(command.email());

        log.info("Creating complete user email={} role={}", command.email(), command.role());

        try {
            validateEmailNotExists(email);

            Person person = createPersonWithAddress(command);
            Person savedPerson = personRepository.save(person);

            Password password = Password.create(command.password(), passwordEncoder);
            User user = createUserByRole(command, savedPerson, email, password);
            User savedUser = userRepository.save(user);

            CompleteUserDTO result = buildCompleteUserDTO(savedUser, savedPerson);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Complete user created durationMs={} userId={} personId={}",
                    duration, savedUser.getId().getValue(), savedPerson.getId().getValue());

            return result;

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to create complete user email={}: {}", command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to create complete user", e);
        }
    }

    public boolean isEmailAvailable(Email email) {
        return !userRepository.existsByEmail(email);
    }

    private void validateEmailNotExists(Email email) {
        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed: email already exists email={}", email.getValue());
            throw new EmailAlreadyExistsException("Email already registered: " + email.getValue());
        }
    }

    private Person createPersonWithInfo(String firstName, String lastName, String gender, String phone) {
        Person person = Person.create(firstName, lastName);
        person.updatePersonalInfo(firstName, lastName, gender, phone);
        return person;
    }

    private Person createPersonWithAddress(CreateCompleteUserCommand command) {
        Person person = createPersonWithInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        if (hasAddressInformation(command)) {
            Address address = new Address(
                    command.addressStreet(),
                    command.addressColony(),
                    command.addressMunicipality(),
                    command.addressState(),
                    command.addressPostalCode()
            );
            person.updateAddress(address);
        }

        return person;
    }

    private User createUserByRole(CreateCompleteUserCommand command, Person person, Email email, Password password) {
        return switch (command.role()) {
            case STUDENT -> {
                String studentId = command.userId();
                if (studentId == null || studentId.trim().isEmpty()) {
                    studentId = generateStudentId();
                    log.info("Generated student ID: {}", studentId);
                } else if (!isValidStudentIdFormat(studentId)) {
                    throw new IllegalArgumentException("Invalid student ID format. Should be STUDED-UUID format");
                }
                yield User.createStudent(person, email, password, studentId);
            }
            case TEACHER -> User.createTeacher(person, email, password);
            case ADMIN -> User.createAdmin(person, email, password);
        };
    }

    private String generateStudentId() {
        String uuid = java.util.UUID.randomUUID().toString().toUpperCase();
        String shortUuid = uuid.substring(0, 8);
        return "STUDED-" + shortUuid;
    }

    private boolean isValidStudentIdFormat(String studentId) {
        return studentId != null &&
                studentId.startsWith("STUDED-") &&
                studentId.length() > "STUDED-".length();
    }

    private CompleteUserDTO buildCompleteUserDTO(User user, Person person) {
        AddressDTO addressDTO = person.getAddress() != null
                ? new AddressDTO(
                person.getAddress().getStreet(),
                person.getAddress().getColony(),
                person.getAddress().getMunicipality(),
                person.getAddress().getState(),
                person.getAddress().getPostalCode()
        )
                : null;

        return new CompleteUserDTO(
                user.getId().getValue(),
                person.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                person.getFirstName(),
                person.getLastName(),
                person.getGender(),
                person.getPhone(),
                person.getFullName(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO,
                user.getCreatedAt().toString(),
                String.format("%s created successfully", user.getRole().name().toLowerCase())
        );
    }

    private boolean hasAddressInformation(CreateCompleteUserCommand command) {
        return command.addressStreet() != null && !command.addressStreet().trim().isEmpty() &&
                command.addressColony() != null && !command.addressColony().trim().isEmpty() &&
                command.addressMunicipality() != null && !command.addressMunicipality().trim().isEmpty() &&
                command.addressState() != null && !command.addressState().trim().isEmpty() &&
                command.addressPostalCode() != null && !command.addressPostalCode().trim().isEmpty();
    }
}