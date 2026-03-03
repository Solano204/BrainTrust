package com.braintrust.identity.application.helpers.user;


import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
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

    private final UserRepository    userRepository;
    private final PersonRepository  personRepository;
    private final PasswordEncoder   passwordEncoder;

    public UserManagementHelper(UserRepository userRepository,
                                PersonRepository personRepository,
                                PasswordEncoder passwordEncoder) {
        this.userRepository   = userRepository;
        this.personRepository = personRepository;
        this.passwordEncoder  = passwordEncoder;
    }

    // ── Eliminar usuario ──────────────────────────────────────────────────────

    /**
     * Elimina SOLO el usuario (cuenta). La persona vinculada NO se elimina.
     * Las personas son independientes y pueden existir sin usuario.
     *
     * Regla de confirmación: el controller debe solicitar confirmación antes
     * de llamar este método.
     */
    @Transactional
    public void deleteUser(UserId userId) {
        log.warn("🗑️ Deleting User ID: {} (persona vinculada se conserva)", userId.getValue());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            // Solo eliminamos el usuario, NO la persona
            userRepository.deleteById(userId);
            log.warn("✅ User {} deleted. Person {} conserved.",
                    userId.getValue(), user.getPersonId().getValue());
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to delete User {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete user", e);
        }
    }

    // ── Los demás métodos no cambian ─────────────────────────────────────────

    @Transactional
    public void updateUserPersonalInfo(UpdateUserInfoCommand command) {
        UserId userId = UserId.fromString(command.userId());
        try {
            User user = findUserByIdOrThrow(userId, userRepository);
            var person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            person.updatePersonalInfo(
                    command.firstName(), null,
                    command.lastName(),  null,
                    command.gender(), command.phone()
            );
            personRepository.save(person);
        } catch (Exception e) {
            log.error("❌ Failed to update PII for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void changeUserEmail(ChangeEmailCommand command) {
        UserId userId = UserId.fromString(command.userId());
        User user = findUserByIdOrThrow(userId, userRepository);
        Email newEmail = new Email(command.newEmail());
        if (userRepository.existsByEmail(newEmail)) {
            throw new EmailAlreadyExistsException("Email already in use");
        }
        user.changeEmail(newEmail);
        userRepository.save(user);
    }

    @Transactional
    public void changeUserPassword(ChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        User user = findUserByIdOrThrow(userId, userRepository);
        if (!user.authenticate(command.currentPassword(), passwordEncoder)) {
            throw new InvalidPasswordException("Current password is incorrect");
        }
        user.changePassword(Password.create(command.newPassword(), passwordEncoder));
        userRepository.save(user);
    }

    @Transactional
    public void adminChangePassword(AdminChangePasswordCommand command) {
        UserId userId = UserId.fromString(command.userId());
        User user = findUserByIdOrThrow(userId, userRepository);
        user.changePassword(Password.create(command.newPassword(), passwordEncoder));
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(UserId userId) {
        User user = findUserByIdOrThrow(userId, userRepository);
        user.activate();
        userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(UserId userId) {
        User user = findUserByIdOrThrow(userId, userRepository);
        user.deactivate();
        userRepository.save(user);
    }
}