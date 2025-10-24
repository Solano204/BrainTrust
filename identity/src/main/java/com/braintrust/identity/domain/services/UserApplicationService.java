// 📍 identity/application/services/UserApplicationService.java
package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.ports.out.AuthenticationProvider;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.InvalidCredentialsException;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.braintrust.identity.application.Maps.EntityMaps.toUserDTO;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findUserByIdOrThrow;

@Service
@Transactional
public class UserApplicationService implements UserService {

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationProvider authenticationProvider;

    public UserApplicationService(
            UserRepository userRepository,
            PersonRepository personRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationProvider authenticationProvider
    ) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationProvider = authenticationProvider;
    }

    // ✅ COMMANDS - Use Case Implementations

    @Override
    public UserId registerTeacher(RegisterTeacherCommand command) {
        // 1. Validate email availability
        Email email = new Email(command.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already registered: " + command.email());
        }

        // 2. Create Person first
        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );
        Person savedPerson = personRepository.save(person);

        // 3. Create User with encrypted password
        Password password = Password.create(command.password(), passwordEncoder);
        User teacher = User.createTeacher(savedPerson, email, password);

        // 4. Save and return
        User savedUser = userRepository.save(teacher);
        return savedUser.getId();
    }

    @Override
    public UserId registerStudent(RegisterStudentCommand command) {
        // 1. Validate email
        Email email = new Email(command.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already registered: " + command.email());
        }

        // 2. Create Person
        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );
        Person savedPerson = personRepository.save(person);

        // 3. Create Student User
        Password password = Password.create(command.password(), passwordEncoder);
        User student = User.createStudent(savedPerson, email, password, command.studentId());

        // 4. Save
        User savedUser = userRepository.save(student);
        return savedUser.getId();
    }

    @Override
    public UserId registerAdmin(RegisterAdminCommand command) {
        Email email = new Email(command.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );
        Person savedPerson = personRepository.save(person);

        Password password = Password.create(command.password(), passwordEncoder);
        User admin = User.createAdmin(savedPerson, email, password);

        User savedUser = userRepository.save(admin);
        return savedUser.getId();
    }

    @Override
    public void updateUserPersonalInfo(UpdateUserInfoCommand command) {
        User user = findUserByIdOrThrow(UserId.fromString(command.userId()), userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);

        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        personRepository.save(person);
    }

    @Override
    public void changeUserEmail(ChangeEmailCommand command) {
        User user = findUserByIdOrThrow(UserId.fromString(command.userId()),userRepository);

        Email newEmail = new Email(command.newEmail());
        if (userRepository.existsByEmail(newEmail)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        user.changeEmail(newEmail);
        userRepository.save(user);
    }

    @Override
    public void changeUserPassword(ChangePasswordCommand command) {
        User user = findUserByIdOrThrow(UserId.fromString(command.userId()),userRepository);

        // Verify current password
        if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
            throw new InvalidPasswordException("Current password is incorrect");
        }

        // Create new password
        Password newPassword = Password.create(command.newPassword(), passwordEncoder);
        user.changePassword(newPassword);

        userRepository.save(user);
    }

    @Override
    public void deactivateUser(UserId userId) {
        User user = findUserByIdOrThrow(userId,userRepository);
        user.deactivate();
        userRepository.save(user);
    }

    @Override
    public void activateUser(UserId userId) {
        User user = findUserByIdOrThrow(userId,userRepository);
        user.activate();
        userRepository.save(user);
    }

    // ✅ QUERIES - Read Use Cases

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        User user = findUserByIdOrThrow(userId,userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email.getValue()));
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException("User not found for person: " + personId.getValue()));
        Person person = findPersonByIdOrThrow(personId,personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(user -> {
                    Person person = personRepository.findById(user.getPersonId())
                            .orElse(null);
                    return toUserDTO(user, person);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        List<User> users = userRepository.findActiveUsers();
        return users.stream()
                .map(user -> {
                    Person person = personRepository.findById(user.getPersonId())
                            .orElse(null);
                    return toUserDTO(user, person);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(Email email) {
        return !userRepository.existsByEmail(email);
    }

    // ✅ AUTHENTICATION

    @Override
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        try {
            Email email = new Email(command.email());
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

            if (!user.isActive()) {
                return AuthenticationResult.failure("User account is inactive");
            }

            if (!user.authenticate(command.password(), passwordEncoder)) {
                return AuthenticationResult.failure("Invalid credentials");
            }

            // Generate token
            String token = authenticationProvider.generateToken(user);

            // Get person info
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            return AuthenticationResult.success(userDTO, token);

        } catch (Exception e) {
            return AuthenticationResult.failure("Authentication failed: " + e.getMessage());
        }
    }




}