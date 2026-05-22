package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaUserRepositoryAdapter implements UserRepository {

    private static final Logger log = LoggerFactory.getLogger(JpaUserRepositoryAdapter.class);

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

    // Helper: convert Role enum → role_id integer
    private Integer toRoleId(Role role) {
        return switch (role) {
            case STUDENT     -> 3;
            case TEACHER     -> 2;
            case ADMIN       -> 1;
            case SYS_MANAGER -> 4;
        };
    }

    @Override
    public Page<User> findByRole(Role role, Pageable pageable) {
        log.debug("Fetching users by Role: {} with pagination. Sort: {}",
                role.name(), pageable.getSort());

        Integer roleId = toRoleId(role);

        try {
            Page<UserJpaEntity> entityPage;
            Sort sort = pageable.getSort();
            boolean hasSort = sort != null && sort.isSorted();

            if (hasSort && sort.getOrderFor("fullName") != null) {
                Sort.Direction direction = sort.getOrderFor("fullName").getDirection();
                Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());

                if (direction == Sort.Direction.ASC) {
                    entityPage = jpaRepository.findByRoleIdOrderByPersonNameAsc(roleId, unsorted);
                } else {
                    entityPage = jpaRepository.findByRoleIdOrderByPersonNameDesc(roleId, unsorted);
                }
            } else if (hasSort) {
                entityPage = jpaRepository.findByRoleIdWithPerson(roleId, pageable);
            } else {
                entityPage = jpaRepository.findByRoleId(roleId, pageable);
            }

            return entityPage.map(mapper::toDomain);

        } catch (Exception e) {
            log.error("❌ Error in findByRole with sorting: {}", e.getMessage(), e);
            // Fallback: plain roleId query without sorting
            return jpaRepository.findByRoleId(roleId, pageable).map(mapper::toDomain);
        }
    }

    @Override
    public Page<User> findByNameContainingAndRole(String name, Role role, Pageable pageable) {
        Integer roleId = toRoleId(role);

        Page<PersonJpaEntity> personPage = personJpaRepository
                .findByFullNameContainingIgnoreCase(name, pageable);

        List<String> personIds = personPage.getContent()
                .stream()
                .map(PersonJpaEntity::getId)
                .collect(Collectors.toList());

        if (personIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return jpaRepository.findByPersonIdInAndRoleId(personIds, roleId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<User> findByRole(Role role) {
        log.debug("Fetching all users with Role: {}", role.name());
        return jpaRepository.findByRoleId(toRoleId(role))
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    // ── Everything below is unchanged ────────────────────────────────────────

    @Override
    public void deleteById(UserId userId) {
        log.warn("🗑️ Deleting User ID: {} with associated Person", userId.getValue());
        try {
            UserJpaEntity userEntity = jpaRepository.findById(userId.getValue())
                    .orElseThrow(() -> {
                        log.warn("❌ User not found for deletion: {}", userId.getValue());
                        return new UserNotFoundException("User not found: " + userId.getValue());
                    });

            String personId = userEntity.getPersonId();
            jpaRepository.deleteById(userId.getValue());
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
            return jpaRepository.findByNameContainingWithPerson(name, pageable)
                    .map(mapper::toDomain);
        } catch (Exception e) {
            log.error("❌ Error in findByNameContaining: {}", e.getMessage(), e);
            Page<PersonJpaEntity> personPage = personJpaRepository
                    .findByFullNameContainingIgnoreCase(name, pageable);

            List<String> personIds = personPage.getContent()
                    .stream()
                    .map(PersonJpaEntity::getId)
                    .collect(Collectors.toList());

            if (personIds.isEmpty()) return Page.empty(pageable);

            return jpaRepository.findByPersonIdIn(personIds, pageable)
                    .map(mapper::toDomain);
        }
    }

    @Override
    public Page<User> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public User save(User user) {
        log.info("Saving User ID {} (Role: {}, Email: {}).",
                user.getId().getValue(), user.getRole().name(), user.getEmail().getValue());
        UserJpaEntity entity = mapper.toEntity(user);
        UserJpaEntity savedEntity = jpaRepository.save(entity);
        log.debug("User saved/updated successfully. Status: {}",
                savedEntity.isActive() ? "ACTIVE" : "INACTIVE");
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(User user) {
        log.warn("Deleting User ID: {}", user.getId().getValue());
        jpaRepository.deleteById(user.getId().getValue());
        log.info("User ID {} deleted successfully.", user.getId().getValue());
    }

    @Override
    public Optional<User> findById(UserId userId) {
        log.debug("Querying database for User ID: {}", userId.getValue());
        return jpaRepository.findById(userId.getValue()).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        log.debug("Querying database by Email: {}", email.getValue());
        return jpaRepository.findByEmail(email.getValue()).map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByPersonId(PersonId personId) {
        log.debug("Querying database by Person ID: {}", personId.getValue());
        return jpaRepository.findByPersonId(personId.getValue()).map(mapper::toDomain);
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