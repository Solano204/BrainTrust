package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findUserByIdOrThrow;

@Component
public class UserManagementHelper {

    private static final Logger log = LoggerFactory.getLogger(UserManagementHelper.class);

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementHelper(
            UserRepository userRepository,
            PersonRepository personRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
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
            log.error("❌ Failed to update PII for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void changeUserEmail(ChangeEmailCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        log.warn("📧 Attempting email change for User {} to: {}", userId.getValue(), command.newEmail());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            Email newEmail = new Email(command.newEmail());
            if (userRepository.existsByEmail(newEmail)) {
                log.warn("❌ Email change failed: New email {} already in use", command.newEmail());
                throw new EmailAlreadyExistsException("Email already in use");
            }

            user.changeEmail(newEmail);
            userRepository.save(user);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ Email changed in {}ms for User {}", duration, userId.getValue());

        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to change email for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void changeUserPassword(ChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        log.warn("🔒 Processing password change for User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
                log.error("❌ Password change failed: Incorrect current password for User {}", userId.getValue());
                throw new InvalidPasswordException("Current password is incorrect");
            }

            Password newPassword = Password.create(command.newPassword(), passwordEncoder);
            user.changePassword(newPassword);

            userRepository.save(user);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ Password changed in {}ms for User {}", duration, userId.getValue());

        } catch (InvalidPasswordException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to change password for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void adminChangePassword(AdminChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();

        log.warn("🔐 ADMIN initiating password reset for User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            Password newPassword = Password.create(command.newPassword(), passwordEncoder);
            user.changePassword(newPassword);

            userRepository.save(user);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ ADMIN password reset completed in {}ms for User ID: {}", duration, userId.getValue());

        } catch (UserNotFoundException e) {
            log.error("❌ ADMIN password reset failed: User {} not found", userId.getValue());
            throw e;
        } catch (Exception e) {
            log.error("❌ ADMIN password reset failed for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to reset password", e);
        }
    }

    @Transactional
    public void activateUser(UserId userId) {
        log.info("✅ Activating User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.activate();
            userRepository.save(user);

            log.info("✅ User {} is now ACTIVE", userId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to activate User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deactivateUser(UserId userId) {
        log.warn("⚠️ Deactivating User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.deactivate();
            userRepository.save(user);

            log.warn("✅ User {} is now INACTIVE", userId.getValue());

        } catch (Exception e) {
            log.error("❌ Failed to deactivate User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deleteUser(UserId userId) {
        long startTime = System.currentTimeMillis();

        log.warn("🗑️ Deleting User ID: {}", userId.getValue());

        try {
            User user = findUserByIdOrThrow(userId, userRepository);

            if (user.isActive()) {
                log.warn("⚠️ Attempting to delete active user: {}", userId.getValue());
            }

            userRepository.deleteById(userId);

            long duration = System.currentTimeMillis() - startTime;
            log.warn("✅ User {} deleted in {}ms. Role: {}, Email: {}",
                    userId.getValue(), duration, user.getRole().name(), user.getEmail().getValue());

        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to delete User {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete user", e);
        }
    }
}