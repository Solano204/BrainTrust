package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.*;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.security.services.JwtService;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Objects;
import java.util.stream.Collectors;

import static com.braintrust.identity.application.Maps.EntityMaps.toUserDTO;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findUserByIdOrThrow;

/**
 * ✅ PRODUCTION-READY User Service with Virtual Threads & Security
 *
 * Este servicio maneja autenticación, autorización y gestión de usuarios.
 *
 * Optimizaciones con Virtual Threads:
 * 1. Registro de usuarios (DB writes parkean VT)
 * 2. Autenticación (bcrypt parkea VT durante hashing)
 * 3. Token generation (CPU-bound pero rápido)
 * 4. Queries parkean VT durante DB access
 *
 * IMPORTANTE:
 * - bcrypt password hashing es CPU-intensive pero parkea el VT
 * - JWT generation es rápido y no requiere optimización
 * - Todos los logs de seguridad usan nivel WARN para auditoría
 */
@Service
@Transactional
public class UserApplicationService implements UserService {

    // 2. INSERT this line at the very top of the class
    private static final Logger log = LoggerFactory.getLogger(UserApplicationService.class);

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
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;

        log.info("✅ UserApplicationService initialized with Virtual Threads support");
    }

    // ------------------------------------------------------------------
    // ✅ REGISTRATION COMMANDS
    // ------------------------------------------------------------------

    /**
     * ✅ REGISTER TEACHER
     *
     * Este método se beneficia de Virtual Threads:
     * - bcrypt hashing parkea el VT (CPU-intensive)
     * - DB writes parkean el VT
     */
    @Override
    public UserId registerTeacher(RegisterTeacherCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        log.info("🎓 Starting TEACHER registration for email: {}", command.email());

        try {
            // ✅ Check email availability (DB query parks VT)
            if (userRepository.existsByEmail(email)) {
                log.warn("❌ Teacher registration failed: Email already exists ({})",
                        command.email());
                throw new EmailAlreadyExistsException(
                        "Email already registered: " + command.email()
                );
            }

            // ✅ Create person
            Person person = Person.create(command.firstName(), command.lastName());
            person.updatePersonalInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );
            Person savedPerson = personRepository.save(person);

            // ✅ Hash password (bcrypt parks VT during CPU work)
            Password password = Password.create(command.password(), passwordEncoder);

            // ✅ Create user
            User teacher = User.createTeacher(savedPerson, email, password);
            User savedUser = userRepository.save(teacher);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ TEACHER registered in {}ms. User ID: {}, Person ID: {}",
                    duration, savedUser.getId().getValue(), savedPerson.getId().getValue());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to register teacher {}: {}",
                    command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register teacher", e);
        }
    }

    @Override
    public UserId registerStudent(RegisterStudentCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        log.info("🎒 Starting STUDENT registration for email: {}", command.email());

        try {
            if (userRepository.existsByEmail(email)) {
                log.warn("❌ Student registration failed: Email already exists ({})",
                        command.email());
                throw new EmailAlreadyExistsException(
                        "Email already registered: " + command.email()
                );
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
            User student = User.createStudent(
                    savedPerson,
                    email,
                    password,
                    command.studentId()
            );
            User savedUser = userRepository.save(student);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ STUDENT registered in {}ms. User ID: {}, Student Ref: {}",
                    duration, savedUser.getId().getValue(), command.studentId());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to register student {}: {}",
                    command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register student", e);
        }
    }

    @Override
    public UserId registerAdmin(RegisterAdminCommand command) {
        Email email = new Email(command.email());
        long startTime = System.currentTimeMillis();

        // ⚠️ WARN level para creación de admin (evento de seguridad)
        log.warn("🔐 Starting ADMIN registration for email: {}", command.email());

        try {
            if (userRepository.existsByEmail(email)) {
                log.warn("❌ Admin registration failed: Email already exists ({})",
                        command.email());
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

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ ADMIN registered in {}ms. User ID: {}",
                    duration, savedUser.getId().getValue());

            return savedUser.getId();

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to register admin {}: {}",
                    command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to register admin", e);
        }
    }

    // ------------------------------------------------------------------
    // ✅ UPDATE COMMANDS
    // ------------------------------------------------------------------

    @Override
    public void updateUserPersonalInfo(UpdateUserInfoCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        log.warn("🔐 Updating PII for User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);

            person.updatePersonalInfo(
                    command.firstName(),
                    command.lastName(),
                    command.gender(),
                    command.phone()
            );

            personRepository.save(person);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ PII updated in {}ms for User {} / Person {}",
                    duration, userId.getValue(), person.getId().getValue());

        } catch (Exception e) {
            log.error("❌ Failed to update PII for User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void changeUserEmail(ChangeEmailCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        log.warn("📧 Attempting email change for User {} to: {}",
                userId.getValue(), command.newEmail());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            Email newEmail = new Email(command.newEmail());
            if (userRepository.existsByEmail(newEmail)) {
                log.warn("❌ Email change failed: New email {} already in use",
                        command.newEmail());
                throw new EmailAlreadyExistsException("Email already in use");
            }

            user.changeEmail(newEmail);
            userRepository.save(user);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ Email changed in {}ms for User {}", duration, userId.getValue());

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to change email for User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void changeUserPassword(ChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        // ⚠️ WARN level para cambios de password (evento de seguridad)
        log.warn("🔒 Processing password change for User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            // ✅ Verify current password (bcrypt parks VT)
            if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
                log.error("❌ Password change failed: Incorrect current password for User {}",
                        userId.getValue());
                throw new InvalidPasswordException("Current password is incorrect");
            }

            // ✅ Hash new password (bcrypt parks VT)
            Password newPassword = Password.create(command.newPassword(), passwordEncoder);
            user.changePassword(newPassword);

            userRepository.save(user);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ Password changed in {}ms for User {}", duration, userId.getValue());

        } catch (InvalidPasswordException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to change password for User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void deactivateUser(UserId userId) {
        log.warn("⚠️ Deactivating User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.deactivate();
            userRepository.save(user);

            log.warn("✅ User {} is now INACTIVE", userId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to deactivate User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void activateUser(UserId userId) {
        log.info("✅ Activating User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.activate();
            userRepository.save(user);

            log.info("✅ User {} is now ACTIVE", userId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to activate User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    // ------------------------------------------------------------------
    // ✅ QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        log.debug("📊 Fetching User DTO by ID: {}", userId.getValue());

        User user = findUserByIdOrThrow(userId, userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);

        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        log.debug("📊 Fetching User DTO by Email: {}", email.getValue());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with email: " + email.getValue()
                ));
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);

        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        log.debug("📊 Fetching User DTO by Person ID: {}", personId.getValue());

        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found for person: " + personId.getValue()
                ));
        Person person = findPersonByIdOrThrow(personId, personRepository);

        return toUserDTO(user, person);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        log.debug("📊 Fetching users by Role: {}", role.name());
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findByRole(
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role
                            .valueOf(role.name())
            );

            List<UserDTO> dtos = users.stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId())
                                .orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved {} users with role {} in {}ms",
                    dtos.size(), role.name(), duration);

            return dtos;

        } catch (Exception e) {
            log.error("❌ Failed to fetch users by role {}: {}",
                    role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users by role", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        log.debug("📊 Fetching all active users");
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findActiveUsers();

            List<UserDTO> dtos = users.stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId())
                                .orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved {} active users in {}ms", dtos.size(), duration);

            return dtos;

        } catch (Exception e) {
            log.error("❌ Failed to fetch active users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch active users", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(Email email) {
        return !userRepository.existsByEmail(email);
    }

    // ------------------------------------------------------------------
    // ✅ AUTHENTICATION FLOWS
    // ------------------------------------------------------------------

    /**
     * ✅ AUTHENTICATE USER
     *
     * Este método se beneficia de Virtual Threads:
     * - bcrypt verification parkea el VT
     * - DB queries parkean el VT
     * - JWT generation es rápido (no necesita optimización)
     */
    @Override
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        long startTime = System.currentTimeMillis();

        log.info("🔐 Starting authentication for email: {}", command.email());

        try {
            // ✅ PHASE 1: Authenticate with Spring Security (bcrypt parks VT)
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            command.email(),
                            command.password()
                    )
            );

            // ✅ PHASE 2: Find user and check active status
            Email email = new Email(command.email());
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("❌ Authentication rejected: Inactive user tried to login: {}",
                        command.email());
                return AuthenticationResult.failure("User account is inactive");
            }

            // ✅ PHASE 3: Get UserDetails for JWT
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // ✅ PHASE 4: Generate tokens (fast, no optimization needed)
            String accessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String refreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            // ✅ PHASE 5: Get person info and build DTO
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Authentication successful in {}ms. User ID: {}",
                    duration, user.getId().getValue());

            return AuthenticationResult.success(
                    userDTO,
                    accessToken,
                    refreshToken,
                    900L  // 15 minutes in seconds
            );

        } catch (BadCredentialsException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("❌ Authentication failed in {}ms: Invalid credentials for email: {}",
                    duration, command.email());
            return AuthenticationResult.failure("Invalid email or password");

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("❌ Authentication failed in {}ms for email {}: {}",
                    duration, command.email(), e.getMessage(), e);
            return AuthenticationResult.failure("Authentication failed: " + e.getMessage());
        }
    }

    /**
     * ✅ REFRESH TOKEN
     */
    @Override
    public AuthenticationResult refreshToken(RefreshTokenCommand command) {
        long startTime = System.currentTimeMillis();

        log.debug("🔄 Processing refresh token request");

        try {
            // ✅ Extract username from refresh token
            String username = jwtService.extractUsername(command.refreshToken());

            // ✅ Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // ✅ Validate refresh token
            if (!jwtService.isRefreshTokenValid(command.refreshToken(), userDetails)) {
                log.warn("❌ Token refresh rejected: Invalid refresh token for user: {}",
                        username);
                return AuthenticationResult.failure("Invalid refresh token");
            }

            // ✅ Find user and check active status
            Email email = new Email(username);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            if (!user.isActive()) {
                log.warn("❌ Token refresh rejected: Inactive user tried to refresh: {}",
                        username);
                return AuthenticationResult.failure("User account is inactive");
            }

            // ✅ Generate new tokens
            String newAccessToken = jwtService.generateAccessToken(userDetails, user.getId());
            String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getId());

            // ✅ Get person info and build DTO
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            UserDTO userDTO = toUserDTO(user, person);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Token refresh successful in {}ms for user: {}",
                    duration, username);

            return AuthenticationResult.success(
                    userDTO,
                    newAccessToken,
                    newRefreshToken,
                    900L
            );

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("❌ Token refresh failed in {}ms: {}", duration, e.getMessage(), e);
            return AuthenticationResult.failure("Token refresh failed: " + e.getMessage());
        }
    }



    @Override
    @Transactional(readOnly = true)
    public MinimalUserInfoDTO getMinimalUserInfo(UserId userId) {
        log.debug("📊 Fetching minimal user info for User ID: {}", userId.getValue());
        long startTime = System.currentTimeMillis();

        try {
            // ✅ Find user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.warn("❌ User not found for minimal info: {}", userId.getValue());
                        return new UserNotFoundException("User not found: " + userId.getValue());
                    });

            // ✅ Find person
            Person person = personRepository.findById(user.getPersonId())
                    .orElseThrow(() -> {
                        log.warn("❌ Person not found for user: {}", userId.getValue());
                        return new UserNotFoundException("Person not found for user: " + userId.getValue());
                    });

            // ✅ Build minimal info DTO
            MinimalUserInfoDTO result = new MinimalUserInfoDTO(
                    user.getId().getValue(),
                    person.getId().getValue(),
                    person.getFirstName(),
                    person.getLastName(),
                    person.getFullName()
            );

            long duration = System.currentTimeMillis() - startTime;
            log.debug("✅ Minimal user info retrieved in {}ms for User ID: {}", duration, userId.getValue());

            return result;

        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to fetch minimal user info for User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }



    @Override
    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> getMinimalUserInfoByIds(List<String> userIds) {
        log.debug("📊 Fetching minimal user info for {} user IDs", userIds.size());
        long startTime = System.currentTimeMillis();

        try {
            List<MinimalUserInfoDTO> result = userIds.stream()
                    .map(userId -> {
                        try {
                            User user = userRepository.findById(UserId.fromString(userId))
                                    .orElse(null);
                            if (user == null) {
                                return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
                            }

                            Person person = personRepository.findById(user.getPersonId())
                                    .orElse(null);
                            if (person == null) {
                                return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
                            }

                            return new MinimalUserInfoDTO(
                                    userId,
                                    person.getId().getValue(),
                                    person.getFirstName(),
                                    person.getLastName(),
                                    person.getFullName()
                            );
                        } catch (Exception e) {
                            log.warn("Failed to fetch minimal info for user {}: {}", userId, e.getMessage());
                            return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
                        }
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved minimal info for {} users in {}ms", result.size(), duration);

            return result;

        } catch (Exception e) {
            log.error("❌ Failed to fetch minimal user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByIds(List<String> userIds) {
        log.debug("📊 Fetching {} users by IDs", userIds.size());
        long startTime = System.currentTimeMillis();

        try {
            List<UserDTO> users = userIds.stream()
                    .map(userId -> {
                        try {
                            return getUserById(UserId.fromString(userId));
                        } catch (Exception e) {
                            log.warn("Failed to fetch user {}: {}", userId, e.getMessage());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved {} users by IDs in {}ms", users.size(), duration);

            return users;

        } catch (Exception e) {
            log.error("❌ Failed to fetch users by IDs: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users by IDs", e);
        }
    }


    @Override
    public CompleteUserDTO createCompleteUser(CreateCompleteUserCommand command) {
        long startTime = System.currentTimeMillis();
        Email email = new Email(command.email());

        log.info("🚀 Creating complete user: {} {} ({})",
                command.firstName(), command.lastName(), command.role());

        try {
            // ✅ PHASE 1: Validate email availability
            if (userRepository.existsByEmail(email)) {
                log.warn("❌ Complete user creation failed: Email already exists ({})",
                        command.email());
                throw new EmailAlreadyExistsException("Email already registered: " + command.email());
            }

            // ✅ PHASE 2: Create person with address
            Person person = createPersonWithAddress(command);
            Person savedPerson = personRepository.save(person);

            // ✅ PHASE 3: Hash password (bcrypt parks VT)
            Password password = Password.create(command.password(), passwordEncoder);

            // ✅ PHASE 4: Create user based on role
            User user = createUserByRole(command, savedPerson, email, password);
            User savedUser = userRepository.save(user);

            // ✅ PHASE 5: Build complete response
            CompleteUserDTO result = buildCompleteUserDTO(savedUser, savedPerson);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Complete user created in {}ms. User ID: {}, Person ID: {}",
                    duration, savedUser.getId().getValue(), savedPerson.getId().getValue());

            return result;

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to create complete user {}: {}",
                    command.email(), e.getMessage(), e);
            throw new RuntimeException("Failed to create complete user", e);
        }
    }

    /**
     * ✅ Create person with address information
     */
    private Person createPersonWithAddress(CreateCompleteUserCommand command) {
        Person person = Person.create(command.firstName(), command.lastName());

        // Update personal info
        person.updatePersonalInfo(
                command.firstName(),
                command.lastName(),
                command.gender(),
                command.phone()
        );

        // Create and set address if provided
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

    /**
     * ✅ Create user based on specific role
     */
    private User createUserByRole(CreateCompleteUserCommand command, Person person,
                                  Email email, Password password) {
        return switch (command.role()) {
            case STUDENT -> {
                if (command.userId() == null || command.userId().trim().isEmpty()) {
                    throw new IllegalArgumentException("Student ID is required for STUDENT role");
                }
                yield User.createStudent(person, email, password, command.userId());
            }
            case TEACHER -> User.createTeacher(person, email, password);
            case ADMIN -> User.createAdmin(person, email, password);
        };
    }

    /**
     * ✅ Build complete user DTO with all information
     */
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

                // Personal information
                person.getFirstName(),
                person.getLastName(),
                person.getGender(),
                person.getPhone(),
                person.getFullName(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),

                // Address
                addressDTO,

                // Timestamps
                user.getCreatedAt().toString(),

                // Success message
                String.format("%s created successfully", user.getRole().name().toLowerCase())
        );
    }

    /**
     * ✅ Check if address information is provided
     */
    private boolean hasAddressInformation(CreateCompleteUserCommand command) {
        return command.addressStreet() != null && !command.addressStreet().trim().isEmpty() &&
                command.addressColony() != null && !command.addressColony().trim().isEmpty() &&
                command.addressMunicipality() != null && !command.addressMunicipality().trim().isEmpty() &&
                command.addressState() != null && !command.addressState().trim().isEmpty() &&
                command.addressPostalCode() != null && !command.addressPostalCode().trim().isEmpty();
    }


}