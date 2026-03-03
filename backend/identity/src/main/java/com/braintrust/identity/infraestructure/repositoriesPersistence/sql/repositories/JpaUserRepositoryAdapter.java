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

    private final UserJpaRepository   jpaRepository;
    private final PersonJpaRepository personJpaRepository;
    private final UserEntityMapper    mapper;

    public JpaUserRepositoryAdapter(UserJpaRepository jpaRepository,
                                    PersonJpaRepository personJpaRepository,
                                    UserEntityMapper mapper) {
        this.jpaRepository       = jpaRepository;
        this.personJpaRepository = personJpaRepository;
        this.mapper              = mapper;
    }

    // ── NUEVO: existsByPersonId ───────────────────────────────────────────────

    @Override
    public boolean existsByPersonId(PersonId personId) {
        return jpaRepository.existsByPersonId(personId.getValue());
    }

    // ── NUEVO: findAllByPersonId ──────────────────────────────────────────────

    @Override
    public List<User> findAllByPersonId(PersonId personId) {
        return jpaRepository.findAllByPersonId(personId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    // ── deleteById — MODIFICADO: ya NO elimina la persona ────────────────────

    @Override
    public void deleteById(UserId userId) {
        log.warn("🗑️ Deleting User ID: {} (persona vinculada se conserva)", userId.getValue());
        try {
            if (!jpaRepository.existsById(userId.getValue())) {
                throw new UserNotFoundException("User not found: " + userId.getValue());
            }
            // Solo eliminamos el usuario, NO la persona
            jpaRepository.deleteById(userId.getValue());
            log.info("✅ User {} deleted. Linked person preserved.", userId.getValue());
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to delete User {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete user", e);
        }
    }

    // ── El resto de métodos no cambia respecto al código original ─────────────

    private Integer toRoleId(Role role) {
        return switch (role) {
            case STUDENT     -> 1;
            case TEACHER     -> 2;
            case ADMIN       -> 3;
            case SYS_MANAGER -> 4;
        };
    }

    @Override
    public Page<User> findByRole(Role role, Pageable pageable) {
        Integer roleId = toRoleId(role);
        try {
            Sort sort = pageable.getSort();
            boolean hasSort = sort != null && sort.isSorted();
            Page<UserJpaEntity> entityPage;
            if (hasSort && sort.getOrderFor("fullName") != null) {
                Sort.Direction dir = sort.getOrderFor("fullName").getDirection();
                Pageable unsorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
                entityPage = dir == Sort.Direction.ASC
                        ? jpaRepository.findByRoleIdOrderByPersonNameAsc(roleId, unsorted)
                        : jpaRepository.findByRoleIdOrderByPersonNameDesc(roleId, unsorted);
            } else {
                entityPage = jpaRepository.findByRoleId(roleId, pageable);
            }
            return entityPage.map(mapper::toDomain);
        } catch (Exception e) {
            return jpaRepository.findByRoleId(roleId, pageable).map(mapper::toDomain);
        }
    }

    @Override
    public Page<User> findByNameContainingAndRole(String name, Role role, Pageable pageable) {
        Integer roleId = toRoleId(role);
        Page<PersonJpaEntity> personPage = personJpaRepository
                .findByFullNameContainingIgnoreCase(name, pageable);
        List<String> personIds = personPage.getContent().stream()
                .map(PersonJpaEntity::getId).collect(Collectors.toList());
        if (personIds.isEmpty()) return Page.empty(pageable);
        return jpaRepository.findByPersonIdInAndRoleId(personIds, roleId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<User> findByRole(Role role) {
        return jpaRepository.findByRoleId(toRoleId(role)).stream()
                .map(mapper::toDomain).collect(Collectors.toList());
    }

    @Override
    public Page<User> findByNameContaining(String name, Pageable pageable) {
        try {
            return jpaRepository.findByNameContainingWithPerson(name, pageable).map(mapper::toDomain);
        } catch (Exception e) {
            Page<PersonJpaEntity> personPage = personJpaRepository
                    .findByFullNameContainingIgnoreCase(name, pageable);
            List<String> personIds = personPage.getContent().stream()
                    .map(PersonJpaEntity::getId).collect(Collectors.toList());
            if (personIds.isEmpty()) return Page.empty(pageable);
            return jpaRepository.findByPersonIdIn(personIds, pageable).map(mapper::toDomain);
        }
    }

    @Override public Page<User> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(mapper::toDomain);
    }
    @Override public User save(User user) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(user)));
    }
    @Override public void delete(User user) {
        jpaRepository.deleteById(user.getId().getValue());
    }
    @Override public Optional<User> findById(UserId userId) {
        return jpaRepository.findById(userId.getValue()).map(mapper::toDomain);
    }
    @Override public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue()).map(mapper::toDomain);
    }
    @Override public Optional<User> findByPersonId(PersonId personId) {
        return jpaRepository.findByPersonId(personId.getValue()).map(mapper::toDomain);
    }
    @Override public List<User> findActiveUsers() {
        return jpaRepository.findByActiveTrue().stream().map(mapper::toDomain).collect(Collectors.toList());
    }
    @Override public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.getValue());
    }
}