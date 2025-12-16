package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

// 📍 identity/infrastructure/persistence/JpaUserRepositoryAdapter.java

import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.UserEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    private final PersonJpaRepository personJpaRepository;
    private final UserEntityMapper mapper;

    public JpaUserRepositoryAdapter(
            UserJpaRepository jpaRepository,
            PersonJpaRepository personJpaRepository,
            UserEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.personJpaRepository = personJpaRepository;
        this.mapper = mapper;
    }

    // ------------------------------------------------------------------
    // ✅ COMMANDS (Mutating Operations)
    // ------------------------------------------------------------------


    @Override
    public Page<User> findByRole(Role role, Pageable pageable) {
        log.debug("Fetching users by Role: {} with pagination. Sort: {}",
                role.name(), pageable.getSort());

        try {
            // Check if sorting by fullName is requested
            Page<UserJpaEntity> entityPage;

            // Handle different sort options
            Sort sort = pageable.getSort();
            boolean hasSort = sort != null && sort.isSorted();

            if (hasSort && sort.getOrderFor("fullName") != null) {
                // Custom handling for fullName sorting
                Sort.Direction direction = sort.getOrderFor("fullName").getDirection();

                if (direction == Sort.Direction.ASC) {
                    entityPage = jpaRepository.findByRoleOrderByPersonNameAsc(role,
                            PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));
                } else {
                    entityPage = jpaRepository.findByRoleOrderByPersonNameDesc(role,
                            PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));
                }
            } else if (hasSort) {
                // Use the generic method for other sorts
                entityPage = jpaRepository.findByRoleWithPerson(role, pageable);
            } else {
                // No sort specified, use default
                entityPage = jpaRepository.findByRole(role, pageable);
            }

            return entityPage.map(mapper::toDomain);

        } catch (Exception e) {
            log.error("❌ Error in findByRole with sorting: {}", e.getMessage(), e);
            // Fallback to simple method
            Page<UserJpaEntity> entityPage = jpaRepository.findByRole(role, pageable);
            return entityPage.map(mapper::toDomain);
        }
    }



    @Override
    public void deleteById(UserId userId) {
        log.warn("🗑️ Deleting User ID: {} with associated Person", userId.getValue());

        try {
            // Find the user first
            UserJpaEntity userEntity = jpaRepository.findById(userId.getValue())
                    .orElseThrow(() -> {
                        log.warn("❌ User not found for deletion: {}", userId.getValue());
                        return new UserNotFoundException("User not found: " + userId.getValue());
                    });

            // Get the person ID before deletion
            String personId = userEntity.getPersonId();

            // Delete the user
            jpaRepository.deleteById(userId.getValue());

            // Delete the associated person
            personJpaRepository.deleteById(personId);

            log.info("✅ User ID {} and Person ID {} deleted successfully.",
                    userId.getValue(), personId);

        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to delete User {} with Person: {}",
                    userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete user with person", e);
        }
    }


    @Override
    public Page<User> findByNameContaining(String name, Pageable pageable) {
        log.debug("Searching users by name: '{}' with pagination", name);

        try {
            // Use the new method that joins with person
            Page<UserJpaEntity> entityPage = jpaRepository.findByNameContainingWithPerson(
                    name, pageable);

            return entityPage.map(mapper::toDomain);

        } catch (Exception e) {
            log.error("❌ Error in findByNameContaining: {}", e.getMessage(), e);
            // Fallback implementation (keep your existing code)
            Page<PersonJpaEntity> personPage = personJpaRepository
                    .findByFullNameContainingIgnoreCase(name, pageable);

            List<String> personIds = personPage.getContent()
                    .stream()
                    .map(PersonJpaEntity::getId)
                    .collect(Collectors.toList());

            if (personIds.isEmpty()) {
                return Page.empty(pageable);
            }

            Page<UserJpaEntity> userPage = jpaRepository.findByPersonIdIn(
                    personIds, pageable);

            return userPage.map(mapper::toDomain);
        }
    }


    @Override
    public Page<User> findAll(Pageable pageable) {
        Page<UserJpaEntity> entityPage = jpaRepository.findAll(pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public Page<User> findByNameContainingAndRole(String name, Role role, Pageable pageable) {
        // First, find persons with matching names
        Page<PersonJpaEntity> personPage = personJpaRepository.findByFullNameContainingIgnoreCase(name, pageable);

        // Get person IDs
        List<String> personIds = personPage.getContent()
                .stream()
                .map(PersonJpaEntity::getId)
                .collect(Collectors.toList());

        if (personIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // Find users associated with those persons and with specific role
        Page<UserJpaEntity> userPage = jpaRepository.findByPersonIdInAndRole(personIds, role, pageable);

        return userPage.map(mapper::toDomain);
    }


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