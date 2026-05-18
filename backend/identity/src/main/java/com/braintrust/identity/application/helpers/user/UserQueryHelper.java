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
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.CatRoleActivityJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final CatRoleActivityJpaRepository roleActivityRepository;

    public UserQueryHelper(UserRepository userRepository,
                           PersonRepository personRepository,
                           CatRoleActivityJpaRepository roleActivityRepository) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.roleActivityRepository = roleActivityRepository;
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

    // Builds a UserDTO with person + activities in one place
    private UserDTO buildUserDTO(User user, Map<Integer, List<RoleActivityDTO>> activitiesMap) {
        Person person = personRepository.findById(user.getPersonId()).orElse(null);
        List<RoleActivityDTO> activities = activitiesMap
                .getOrDefault(toRoleId(user.getRole()), List.of());
        return toUserDTO(user, person, activities);
    }

    // ─── Public query methods ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        log.debug("📊 Fetching User DTO by ID: {}", userId.getValue());

        User user = findUserByIdOrThrow(userId, userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));

        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        log.debug("📊 Fetching User DTO by Email: {}", email.getValue());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with email: " + email.getValue()));
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));

        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        log.debug("📊 Fetching User DTO by Person ID: {}", personId.getValue());

        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found for person: " + personId.getValue()));
        Person person = findPersonByIdOrThrow(personId, personRepository);
        List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(user.getRole()));

        return toUserDTO(user, person, activities);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        log.debug("📊 Fetching all users. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<User> userPage = userRepository.findAll(pageable);
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> buildUserDTO(user, activitiesMap))
                    .collect(Collectors.toList());

            log.info("✅ Retrieved page {} of {} users (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(),
                    userPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByRole(Role role, Pageable pageable) {
        log.debug("📊 Fetching users by Role: {}. Page: {}, Size: {}",
                role.name(), pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());

            Page<User> userPage = userRepository.findByRole(roleJpa, pageable);

            // Only load activities for this specific role — more efficient
            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person, activities);
                    })
                    .collect(Collectors.toList());

            log.info("✅ Retrieved {} users with role {} (total: {}) in {}ms",
                    dtos.size(), role.name(),
                    userPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated users by role {}: {}", role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        log.debug("📊 Fetching all users by Role: {}", role.name());
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findByRole(
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name())
            );

            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));

            List<UserDTO> dtos = users.stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person, activities);
                    })
                    .collect(Collectors.toList());

            log.info("✅ Retrieved {} users with role {} in {}ms",
                    dtos.size(), role.name(), System.currentTimeMillis() - startTime);
            return dtos;

        } catch (Exception e) {
            log.error("❌ Failed to fetch users by role {}: {}", role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByName(String name, Pageable pageable) {
        log.debug("🔍 Searching users by name: '{}'", name);
        long startTime = System.currentTimeMillis();

        try {
            Page<User> userPage = userRepository.findByNameContaining(name, pageable);
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> buildUserDTO(user, activitiesMap))
                    .collect(Collectors.toList());

            log.info("✅ Found {} users matching '{}' (total: {}) in {}ms",
                    dtos.size(), name,
                    userPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to search users by name '{}': {}", name, e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByNameAndRole(String name, Role role, Pageable pageable) {
        log.debug("🔍 Searching users by name: '{}' and role: {}", name, role.name());
        long startTime = System.currentTimeMillis();

        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());

            Page<User> userPage = userRepository.findByNameContainingAndRole(name, roleJpa, pageable);
            List<RoleActivityDTO> activities = getActivitiesForRoleId(toRoleId(role));

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person, activities);
                    })
                    .collect(Collectors.toList());

            log.info("✅ Found {} users matching '{}' with role {} (total: {}) in {}ms",
                    dtos.size(), name, role.name(),
                    userPage.getTotalElements(), System.currentTimeMillis() - startTime);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to search users by name '{}' and role {}: {}",
                    name, role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name and role", e);
        }
    }

    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> searchUsersByName(String searchQuery, Role role) {
        log.info("🔍 Searching users by name: '{}' with role: {}", searchQuery, role);

        try {
            List<User> users = userRepository.findByRole(
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name())
            );

            return users.stream()
                    .filter(user -> matchesSearchQuery(user, searchQuery))
                    .map(this::toMinimalUserInfo)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("❌ Failed to search users by name '{}': {}", searchQuery, e.getMessage(), e);
            throw new RuntimeException("Failed to search users", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        log.debug("📊 Fetching all active users");
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findActiveUsers();
            Map<Integer, List<RoleActivityDTO>> activitiesMap = loadActivitiesMap();

            List<UserDTO> dtos = users.stream()
                    .map(user -> buildUserDTO(user, activitiesMap))
                    .collect(Collectors.toList());

            log.info("✅ Retrieved {} active users in {}ms",
                    dtos.size(), System.currentTimeMillis() - startTime);
            return dtos;

        } catch (Exception e) {
            log.error("❌ Failed to fetch active users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch active users", e);
        }
    }

    @Transactional(readOnly = true)
    public MinimalUserInfoDTO getMinimalUserInfo(UserId userId) {
        log.debug("📊 Fetching minimal user info for User ID: {}", userId.getValue());

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(
                            "User not found: " + userId.getValue()));

            Person person = personRepository.findById(user.getPersonId())
                    .orElseThrow(() -> new UserNotFoundException(
                            "Person not found for user: " + userId.getValue()));

            return new MinimalUserInfoDTO(
                    user.getId().getValue(),
                    person.getId().getValue(),
                    person.getFirstName(),
                    person.getLastName(),
                    person.getFullName()
            );

        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Failed to fetch minimal user info for User {}: {}",
                    userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }

    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> getMinimalUserInfoByIds(List<String> userIds) {
        log.debug("📊 Fetching minimal user info for {} IDs", userIds.size());

        return userIds.stream()
                .map(this::getMinimalUserInfoSafe)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByIds(List<String> userIds) {
        log.debug("📊 Fetching {} users by IDs", userIds.size());

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

    private boolean matchesSearchQuery(User user, String searchQuery) {
        try {
            Person person = personRepository.findById(user.getPersonId()).orElse(null);
            if (person == null) return false;
            String q = searchQuery.toLowerCase();
            return person.getFullName().toLowerCase().contains(q)
                    || person.getFirstName().toLowerCase().contains(q)
                    || person.getLastName().toLowerCase().contains(q);
        } catch (Exception e) {
            log.warn("⚠️ Error filtering user {}: {}", user.getId().getValue(), e.getMessage());
            return false;
        }
    }

    private MinimalUserInfoDTO toMinimalUserInfo(User user) {
        try {
            Person person = personRepository.findById(user.getPersonId())
                    .orElseThrow(() -> new UserNotFoundException("Person not found"));
            return new MinimalUserInfoDTO(
                    user.getId().getValue(),
                    person.getId().getValue(),
                    person.getFirstName(),
                    person.getLastName(),
                    person.getFullName()
            );
        } catch (Exception e) {
            log.warn("⚠️ Failed to map user {}: {}", user.getId().getValue(), e.getMessage());
            return null;
        }
    }

    private MinimalUserInfoDTO getMinimalUserInfoSafe(String userId) {
        try {
            User user = userRepository.findById(UserId.fromString(userId)).orElse(null);
            if (user == null) return fallbackMinimal(userId);

            Person person = personRepository.findById(user.getPersonId()).orElse(null);
            if (person == null) return fallbackMinimal(userId);

            return new MinimalUserInfoDTO(
                    userId,
                    person.getId().getValue(),
                    person.getFirstName(),
                    person.getLastName(),
                    person.getFullName()
            );
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch minimal info for user {}: {}", userId, e.getMessage());
            return fallbackMinimal(userId);
        }
    }

    private MinimalUserInfoDTO fallbackMinimal(String userId) {
        return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
    }
}