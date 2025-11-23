package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

// 📍 identity/infrastructure/persistence/JpaUserRepositoryAdapter.java

import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.UserEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
// other imports...

@Repository
public class JpaUserRepositoryAdapter implements UserRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaUserRepositoryAdapter.class);
    private final UserJpaRepository jpaRepository;
    private final UserEntityMapper mapper;

    public JpaUserRepositoryAdapter(
            UserJpaRepository jpaRepository,
            UserEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaUserRepositoryAdapter.");
    }

    // ------------------------------------------------------------------
    // ✅ COMMANDS (Mutating Operations)
    // ------------------------------------------------------------------

    @Override
    public User save(User user) {
        log.info("Saving User ID {} (Role: {}, Email: {}).",
                user.getId().getValue(), user.getRole().name(), user.getEmail().getValue());

        UserJpaEntity entity = mapper.toEntity(user);
        // Note: The password hash is handled in the mapper, but the operation is logged here.
        UserJpaEntity savedEntity = jpaRepository.save(entity);

        log.debug("User saved/updated successfully. Status: {}", savedEntity.isActive() ? "ACTIVE" : "INACTIVE");
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(User user) {
        log.warn("Deleting User ID: {}", user.getId().getValue());
        jpaRepository.deleteById(user.getId().getValue());
        log.info("User ID {} deleted successfully.", user.getId().getValue());
    }

    // ------------------------------------------------------------------
    // ✅ QUERIES (Read Operations)
    // ------------------------------------------------------------------

    @Override
    public Optional<User> findById(UserId userId) {
        log.debug("Querying database for User ID: {}", userId.getValue());
        return jpaRepository.findById(userId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        // Log sensitive PII at debug level
        log.debug("Querying database by Email: {}", email.getValue());
        return jpaRepository.findByEmail(email.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByPersonId(PersonId personId) {
        log.debug("Querying database by Person ID: {}", personId.getValue());
        return jpaRepository.findByPersonId(personId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<User> findByRole(Role role) {
        log.debug("Fetching all users with Role: {}", role.name());
        return jpaRepository.findByRole(role)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> findActiveUsers() {
        log.debug("Fetching all active users.");
        return jpaRepository.findByActiveTrue()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(Email email) {
        log.trace("Checking existence for Email: {}", email.getValue());
        return jpaRepository.existsByEmail(email.getValue());
    }
}