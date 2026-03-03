package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.dtos.dtos.catalog.RoleActivityDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatRoleActivityJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.CatRoleActivityJpaRepository;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.braintrust.identity.application.Maps.EntityMaps.toUserDTO;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findUserByIdOrThrow;

@Component
public class UserQueryHelper {

    private static final Logger log = LoggerFactory.getLogger(UserQueryHelper.class);

    private final UserRepository               userRepository;
    private final PersonRepository             personRepository;
    private final CatRoleActivityJpaRepository roleActivityRepository;
    private final UserJpaRepository            userJpaRepository;

    public UserQueryHelper(UserRepository userRepository,
                           PersonRepository personRepository,
                           CatRoleActivityJpaRepository roleActivityRepository,
                           UserJpaRepository userJpaRepository) {
        this.userRepository         = userRepository;
        this.personRepository       = personRepository;
        this.roleActivityRepository = roleActivityRepository;
        this.userJpaRepository      = userJpaRepository;
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private List<RoleActivityDTO> getActivitiesForRoleId(Integer roleId) {
        return roleActivityRepository.findByRoleId(roleId)
                .stream()
                .map(a -> new RoleActivityDTO(a.getCode(), a.getActivity(), a.getDescription()))
                .toList();
    }

    private Map<Integer, List<RoleActivityDTO>> loadActivitiesMap() {
        return roleActivityRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        CatRoleActivityJpaEntity::getRoleId,
                        Collectors.mapping(
                                a -> new RoleActivityDTO(a.getCode(), a.getActivity(), a.getDescription()),
                                Collectors.toList()
                        )
                ));
    }

    private Integer toRoleId(Role role) {
        return switch (role) {
            case STUDENT -> 1;
            case TEACHER -> 2;
            case ADMIN   -> 3;
        };
    }

    private UserDTO buildUserDTO(User user, Map<Integer, List<RoleActivityDTO>> activitiesMap) {
        Person person = personRepository.findById(user.getPersonId()).orElse(null);
        List<RoleActivityDTO> activities = activitiesMap
                .getOrDefault(toRoleId(user.getRole()), List.of());
        return toUserDTO(user, person, activities);
    }

    // ─── Public query methods ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        User user = findUserByIdOrThrow(userId, userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));
        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with email: " + email.getValue()));
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));
        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found for person: " + personId.getValue()));
        Person person = findPersonByIdOrThrow(personId, personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));
        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        try {
            Page<User> userPage = userRepository.findAll(pageable);
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();
            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(u -> buildUserDTO(u, activitiesMap))
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
        } catch (Exception e) {
            log.error("❌ getAllUsers failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByRole(Role role, Pageable pageable) {
        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());
            Page<User> userPage = userRepository.findByRole(roleJpa, pageable);
            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));
            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(u -> {
                        Person p = personRepository.findById(u.getPersonId()).orElse(null);
                        return toUserDTO(u, p, activities);
                    })
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
        } catch (Exception e) {
            log.error("❌ getUsersByRole(page) failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());
            List<User> users = userRepository.findByRole(roleJpa);
            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));
            return users.stream()
                    .map(u -> {
                        Person p = personRepository.findById(u.getPersonId()).orElse(null);
                        return toUserDTO(u, p, activities);
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ getUsersByRole(list) failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByName(String name, Pageable pageable) {
        try {
            Page<User> userPage = userRepository.findByNameContaining(name, pageable);
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();
            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(u -> buildUserDTO(u, activitiesMap))
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
        } catch (Exception e) {
            log.error("❌ searchUsersByName failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByNameAndRole(String name, Role role, Pageable pageable) {
        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());
            Page<User> userPage = userRepository.findByNameContainingAndRole(name, roleJpa, pageable);
            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));
            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(u -> {
                        Person p = personRepository.findById(u.getPersonId()).orElse(null);
                        return toUserDTO(u, p, activities);
                    })
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());
        } catch (Exception e) {
            log.error("❌ searchUsersByNameAndRole failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name and role", e);
        }
    }

    /**
     * ✅ ROOT CAUSE FIX — used by CourseEnrollmentHelper.searchStudentsForEnrollment()
     *
     * OLD (broken) approach:
     *   1. Load ALL users for a role from DB
     *   2. Filter in-memory calling person.getFullName()
     *   → ALWAYS returned empty because @Transient fields on PersonJpaEntity
     *     (primerNombre, apellidoPaterno, etc.) are NULL when loaded via findById.
     *     They only get populated by native JOIN queries, never by simple entity loads.
     *
     * NEW (fixed) approach:
     *   → Delegates entirely to findByNameAndRoleNative() which does the JOIN
     *     in the database with the correct catalog table column names.
     *     No in-memory filtering whatsoever.
     */
    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> searchUsersByName(String searchQuery, Role role) {
        log.info("🔍 [SQL search] name='{}' role={}", searchQuery, role);
        try {
            Integer roleId = toRoleId(role);
            // Use a large page — enrollment search doesn't paginate
            Pageable unpaged = PageRequest.of(0, 500);

            Page<UserJpaEntity> page = userJpaRepository
                    .findByNameAndRoleNative(searchQuery, roleId, unpaged);

            List<MinimalUserInfoDTO> results = page.getContent().stream()
                    .map(entity -> {
                        try {
                            Person person = personRepository
                                    .findById(new PersonId(entity.getPersonId().toString()))
                                    .orElse(null);
                            if (person == null) {
                                log.warn("⚠️ Person not found for user {}", entity.getId());
                                return null;
                            }
                            return new MinimalUserInfoDTO(
                                    entity.getId(),
                                    person.getId().getValue(),
                                    person.getPrimerNombre(),
                                    person.getApellidoPaterno(),
                                    person.getFullName()
                            );
                        } catch (Exception e) {
                            log.warn("⚠️ Failed to map user {}: {}", entity.getId(), e.getMessage());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            log.info("✅ Found {} results for name='{}' role={}", results.size(), searchQuery, role);
            return results;

        } catch (Exception e) {
            log.error("❌ searchUsersByName(role) failed for '{}': {}", searchQuery, e.getMessage(), e);
            throw new RuntimeException("Failed to search users", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        try {
            List<User> users = userRepository.findActiveUsers();
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();
            return users.stream()
                    .map(u -> buildUserDTO(u, activitiesMap))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("❌ getActiveUsers failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch active users", e);
        }
    }

    @Transactional(readOnly = true)
    public MinimalUserInfoDTO getMinimalUserInfo(UserId userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found: " + userId.getValue()));
            Person person = personRepository.findById(user.getPersonId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Person not found for user: " + userId.getValue()));
            return buildMinimalDTO(userId.getValue(), person);
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ getMinimalUserInfo failed for {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }

    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> getMinimalUserInfoByIds(List<String> userIds) {
        return userIds.stream()
                .map(this::getMinimalUserInfoSafe)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByIds(List<String> userIds) {
        return userIds.stream()
                .map(userId -> {
                    try {
                        return getUserById(UserId.fromString(userId));
                    } catch (Exception e) {
                        log.warn("⚠️ Failed to fetch user {}: {}", userId, e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private MinimalUserInfoDTO buildMinimalDTO(String userId, Person person) {
        return new MinimalUserInfoDTO(
                userId,
                person.getId().getValue(),
                person.getPrimerNombre(),
                person.getApellidoPaterno(),
                person.getFullName()
        );
    }

    private MinimalUserInfoDTO getMinimalUserInfoSafe(String userId) {
        try {
            User user = userRepository.findById(UserId.fromString(userId)).orElse(null);
            if (user == null) return fallbackMinimal(userId);
            Person person = personRepository.findById(user.getPersonId()).orElse(null);
            if (person == null) return fallbackMinimal(userId);
            return buildMinimalDTO(userId, person);
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch minimal info for user {}: {}", userId, e.getMessage());
            return fallbackMinimal(userId);
        }
    }

    private MinimalUserInfoDTO fallbackMinimal(String userId) {
        return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
    }
}