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
        log.warn("Updating PII for userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            person.updatePersonalInfo(command.firstName(), command.lastName(), command.gender(), command.phone());
            personRepository.save(person);
            long duration = System.currentTimeMillis() - startTime;
            log.warn("PII updated durationMs={} userId={} personId={}", duration, userId.getValue(), person.getId().getValue());
        } catch (Exception e) {
            log.error("Failed to update PII for userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void changeUserEmail(ChangeEmailCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();
        log.warn("Email change requested userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            Email newEmail = new Email(command.newEmail());
            if (userRepository.existsByEmail(newEmail)) {
                log.warn("Email change failed: address already in use email={}", command.newEmail());
                throw new EmailAlreadyExistsException("Email already in use");
            }
            user.changeEmail(newEmail);
            userRepository.save(user);
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Email changed durationMs={} userId={}", duration, userId.getValue());
        } catch (EmailAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to change email for userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void changeUserPassword(ChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();
        log.warn("Password change requested userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
                log.error("Password change failed: incorrect current password userId={}", userId.getValue());
                throw new InvalidPasswordException("Current password is incorrect");
            }
            Password newPassword = Password.create(command.newPassword(), passwordEncoder);
            user.changePassword(newPassword);
            userRepository.save(user);
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Password changed durationMs={} userId={}", duration, userId.getValue());
        } catch (InvalidPasswordException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to change password for userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void adminChangePassword(AdminChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        long startTime = System.currentTimeMillis();
        log.warn("Admin password reset initiated for userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            Password newPassword = Password.create(command.newPassword(), passwordEncoder);
            user.changePassword(newPassword);
            userRepository.save(user);
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Admin password reset complete durationMs={} userId={}", duration, userId.getValue());
        } catch (UserNotFoundException e) {
            log.error("Admin password reset failed: user not found userId={}", userId.getValue());
            throw e;
        } catch (Exception e) {
            log.error("Admin password reset failed for userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to reset password", e);
        }
    }

    @Transactional
    public void activateUser(UserId userId) {
        log.info("Activating userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.activate();
            userRepository.save(user);
            log.info("User activated userId={}", userId.getValue());
        } catch (Exception e) {
            log.error("Failed to activate userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deactivateUser(UserId userId) {
        log.warn("Deactivating userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            user.deactivate();
            userRepository.save(user);
            log.warn("User deactivated userId={}", userId.getValue());
        } catch (Exception e) {
            log.error("Failed to deactivate userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deleteUser(UserId userId) {
        long startTime = System.currentTimeMillis();
        log.warn("Deleting userId={}", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            if (user.isActive()) {
                log.warn("Deleting active user userId={}", userId.getValue());
            }
            userRepository.deleteById(userId);
            long duration = System.currentTimeMillis() - startTime;
            log.warn("User deleted durationMs={} userId={} role={}", duration, userId.getValue(), user.getRole().name());
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete userId={}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete user", e);
        }
    }
}
