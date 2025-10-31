// 📍 identity/application/services/UserApplicationService.java
package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.ports.out.AuthenticationProvider;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.security.services.JwtService;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
@Slf4j // ⬅️ Enable the 'log' variable
public class UserApplicationService implements UserService {

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public UserApplicationService(
            UserRepository userRepository,
            PersonRepository personRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationProvider authenticationProvider, AuthenticationManager authenticationManager, JwtService jwtService, UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // ------------------------------------------------------------------
    // ✅ COMMANDS - Registration
    // ------------------------------------------------------------------

    @Override
    public UserId registerTeacher(RegisterTeacherCommand command) {
        Email email = new Email(command.email());
        log.info("Starting registration for new TEACHER with email: {}", command.email());

        if (userRepository.existsByEmail(email)) {
            log.warn("Teacher registration failed: Email already registered ({})", command.email());
            throw new EmailAlreadyExistsException("Email already registered: " + command.email());
        }

        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(command.firstName(), command.lastName(), command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);

        Password password = Password.create(command.password(), passwordEncoder);
        User teacher = User.createTeacher(savedPerson, email, password);

        User savedUser = userRepository.save(teacher);
        log.info("TEACHER registered successfully. User ID: {}, Person ID: {}", savedUser.getId().getValue(), savedPerson.getId().getValue());
        return savedUser.getId();
    }

    @Override
    public UserId registerStudent(RegisterStudentCommand command) {
        Email email = new Email(command.email());
        log.info("Starting registration for new STUDENT with email: {}", command.email());

        if (userRepository.existsByEmail(email)) {
            log.warn("Student registration failed: Email already registered ({})", command.email());
            throw new EmailAlreadyExistsException("Email already registered: " + command.email());
        }

        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(command.firstName(), command.lastName(), command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);

        Password password = Password.create(command.password(), passwordEncoder);
        User student = User.createStudent(savedPerson, email, password, command.studentId());

        User savedUser = userRepository.save(student);
        log.info("STUDENT registered successfully. User ID: {}, Student Ref ID: {}", savedUser.getId().getValue(), command.studentId());
        return savedUser.getId();
    }

    @Override
    public UserId registerAdmin(RegisterAdminCommand command) {
        Email email = new Email(command.email());
        log.warn("Starting registration for new ADMIN with email: {}", command.email()); // Warn for admin creation

        if (userRepository.existsByEmail(email)) {
            log.warn("Admin registration failed: Email already registered ({})", command.email());
            throw new EmailAlreadyExistsException("Email already registered");
        }

        Person person = Person.create(command.firstName(), command.lastName());
        person.updatePersonalInfo(command.firstName(), command.lastName(), command.gender(), command.phone());
        Person savedPerson = personRepository.save(person);

        Password password = Password.create(command.password(), passwordEncoder);
        User admin = User.createAdmin(savedPerson, email, password);

        User savedUser = userRepository.save(admin);
        log.warn("ADMIN registered successfully. User ID: {}", savedUser.getId().getValue());
        return savedUser.getId();
    }

    // ------------------------------------------------------------------
    // ✅ COMMANDS - Update
    // ------------------------------------------------------------------

    @Override
    public void updateUserPersonalInfo(UpdateUserInfoCommand command) {
        UserId userId = UserId.fromString(command.userId());
        log.info("Updating PII for User ID: {}", userId.getValue());

        User user = findUserByIdOrThrow(userId, userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);

        person.updatePersonalInfo(command.firstName(), command.lastName(), command.gender(), command.phone());

        personRepository.save(person);
        log.debug("PII updated for User ID {} and Person ID {}", userId.getValue(), person.getId().getValue());
    }

    @Override
    public void changeUserEmail(ChangeEmailCommand command) {
        UserId userId = UserId.fromString(command.userId());
        log.info("Attempting email change for User ID {} to new email: {}", userId.getValue(), command.newEmail());

        User user = findUserByIdOrThrow(userId,userRepository);

        Email newEmail = new Email(command.newEmail());
        if (userRepository.existsByEmail(newEmail)) {
            log.warn("Email change failed: New email {} is already in use.", command.newEmail());
            throw new EmailAlreadyExistsException("Email already in use");
        }

        user.changeEmail(newEmail);
        userRepository.save(user);
        log.info("Email successfully changed for User ID {}.", userId.getValue());
    }

    @Override
    public void changeUserPassword(ChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        log.warn("Processing password change request for User ID: {}", userId.getValue()); // Warn level for security events

        User user = findUserByIdOrThrow(userId,userRepository);

        if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
            log.error("Password change failed: Current password incorrect for User ID {}.", userId.getValue());
            throw new InvalidPasswordException("Current password is incorrect");
        }

        Password newPassword = Password.create(command.newPassword(), passwordEncoder);
        user.changePassword(newPassword);

        userRepository.save(user);
        log.info("Password successfully updated for User ID {}.", userId.getValue());
    }

    @Override
    public void deactivateUser(UserId userId) {
        log.warn("Deactivating User ID: {}", userId.getValue());
        User user = findUserByIdOrThrow(userId,userRepository);
        user.deactivate();
        userRepository.save(user);
        log.info("User ID {} is now INACTIVE.", userId.getValue());
    }

    @Override
    public void activateUser(UserId userId) {
        log.info("Activating User ID: {}", userId.getValue());
        User user = findUserByIdOrThrow(userId,userRepository);
        user.activate();
        userRepository.save(user);
        log.info("User ID {} is now ACTIVE.", userId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        log.debug("Querying User and Person DTO by User ID: {}", userId.getValue());
        User user = findUserByIdOrThrow(userId,userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        log.debug("Querying User and Person DTO by Email: {}", email.getValue());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email.getValue()));
        Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        log.debug("Querying User DTO by Person ID: {}", personId.getValue());
        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException("User not found for person: " + personId.getValue()));
        Person person = findPersonByIdOrThrow(personId,personRepository);
        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        log.debug("Fetching all users with Role: {}", role.name());

        List<User> users = userRepository.findByRole(com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name()));
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
        log.debug("Fetching all active users.");
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
        log.trace("Checking email availability for: {}", email.getValue());
        return !userRepository.existsByEmail(email);
    }

    // ------------------------------------------------------------------
    // ✅ AUTHENTICATION FLOWS
    // ------------------------------------------------------------------

    @Override
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        try {
            log.info("Starting authentication process for email: {}", command.email());

            // 1. Authenticate with Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            command.email(),
                            command.password()
                    )
            );

            // 2. Find user in repository (to check active status)
            Email email = new Email(command.email());
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("Authentication rejected: Inactive user attempted to login: {}", command.email());
                return AuthenticationResult.failure("User account is inactive");
            }

            // 3. Get UserDetails for JWT generation
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // 4. Generate tokens
            String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            // 5. Get person info and DTO
            Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            log.info("Authentication successful. User ID: {}", user.getId().getValue());

            return AuthenticationResult.success(
                    userDTO,
                    accessToken,
                    refreshToken,
                    900L  // 15 minutes in seconds
            );

        } catch (BadCredentialsException e) {
            log.warn("Authentication attempt failed: Invalid credentials for email: {}", command.email());
            return AuthenticationResult.failure("Invalid email or password");
        } catch (Exception e) {
            log.error("Authentication process failed unexpectedly for email: {}", command.email(), e);
            return AuthenticationResult.failure("Authentication failed: " + e.getMessage());
        }
    }

    @Override
    public AuthenticationResult refreshToken(RefreshTokenCommand command) {
        try {
            log.debug("Processing refresh token request.");

            // 1. Extract username/email from refresh token
            String username = jwtService.extractUsername(command.refreshToken());

            // 2. Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 3. Validate refresh token signature/expiration
            if (!jwtService.isRefreshTokenValid(command.refreshToken(), userDetails)) {
                log.warn("Token refresh rejected: Invalid refresh token for user: {}", username);
                return AuthenticationResult.failure("Invalid refresh token");
            }

            // 4. Find user to check active status
            Email email = new Email(username);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("Token refresh rejected: Inactive user tried to refresh: {}", username);
                return AuthenticationResult.failure("User account is inactive");
            }

            // 5. Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            // 6. Get person info and DTO
            Person person = findPersonByIdOrThrow(user.getPersonId(),personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            log.info("Token refresh successful for user: {}", username);

            return AuthenticationResult.success(
                    userDTO,
                    newAccessToken,
                    newRefreshToken,
                    900L
            );

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage(), e);
            return AuthenticationResult.failure("Token refresh failed: " + e.getMessage());
        }
    }
}