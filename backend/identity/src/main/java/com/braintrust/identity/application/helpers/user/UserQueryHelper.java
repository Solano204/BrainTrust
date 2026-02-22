package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    public UserQueryHelper(UserRepository userRepository, PersonRepository personRepository) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        log.debug("📊 Fetching User DTO by ID: {}", userId.getValue());

        User user = findUserByIdOrThrow(userId, userRepository);
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);

        return toUserDTO(user, person);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        log.debug("📊 Fetching User DTO by Email: {}", email.getValue());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email.getValue()));
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);

        return toUserDTO(user, person);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        log.debug("📊 Fetching User DTO by Person ID: {}", personId.getValue());

        User user = userRepository.findByPersonId(personId)
                .orElseThrow(() -> new UserNotFoundException("User not found for person: " + personId.getValue()));
        Person person = findPersonByIdOrThrow(personId, personRepository);

        return toUserDTO(user, person);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        log.debug("📊 Fetching all users with pagination. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<User> userPage = userRepository.findAll(pageable);

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} users (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(), userPage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated users: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByRole(Role role, Pageable pageable) {
        log.debug("📊 Fetching users by Role: {} with pagination. Page: {}, Size: {}",
                role.name(), pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());

            Page<User> userPage = userRepository.findByRole(roleJpa, pageable);

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} users with role {} (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(), role.name(), userPage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated users by role {}: {}", role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        log.debug("📊 Fetching users by Role: {}", role.name());
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findByRole(
                    com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name())
            );

            List<UserDTO> dtos = users.stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved {} users with role {} in {}ms", dtos.size(), role.name(), duration);

            return dtos;

        } catch (Exception e) {
            log.error("❌ Failed to fetch users by role {}: {}", role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users by role", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByName(String name, Pageable pageable) {
        log.debug("🔍 Searching users by name: '{}' with pagination. Page: {}, Size: {}",
                name, pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<User> userPage = userRepository.findByNameContaining(name, pageable);

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Found {} users matching '{}' in page {} (total: {}) in {}ms",
                    dtos.size(), name, pageable.getPageNumber(), userPage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to search users by name '{}': {}", name, e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByNameAndRole(String name, Role role, Pageable pageable) {
        log.debug("🔍 Searching users by name: '{}' and role: {} with pagination. Page: {}, Size: {}",
                name, role.name(), pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role roleJpa =
                com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.valueOf(role.name());

        try {
            Page<User> userPage = userRepository.findByNameContainingAndRole(name, roleJpa, pageable);

            List<UserDTO> dtos = userPage.getContent().stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
                        return toUserDTO(user, person);
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Found {} users matching '{}' with role {} in page {} (total: {}) in {}ms",
                    dtos.size(), name, role.name(), pageable.getPageNumber(), userPage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, userPage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to search users by name '{}' and role {}: {}",
                    name, role.name(), e.getMessage(), e);
            throw new RuntimeException("Failed to search users by name and role", e);
        }
    }

    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> searchUsersByName(String searchQuery, Role role) {
        log.info("Searching users by name: '{}' with role filter: {}", searchQuery, role);

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
            log.error("Failed to search users by name '{}': {}", searchQuery, e.getMessage(), e);
            throw new RuntimeException("Failed to search users", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        log.debug("📊 Fetching all active users");
        long startTime = System.currentTimeMillis();

        try {
            List<User> users = userRepository.findActiveUsers();

            List<UserDTO> dtos = users.stream()
                    .map(user -> {
                        Person person = personRepository.findById(user.getPersonId()).orElse(null);
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

    @Transactional(readOnly = true)
    public MinimalUserInfoDTO getMinimalUserInfo(UserId userId) {
        log.debug("📊 Fetching minimal user info for User ID: {}", userId.getValue());
        long startTime = System.currentTimeMillis();

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.warn("❌ User not found for minimal info: {}", userId.getValue());
                        return new UserNotFoundException("User not found: " + userId.getValue());
                    });

            Person person = personRepository.findById(user.getPersonId())
                    .orElseThrow(() -> {
                        log.warn("❌ Person not found for user: {}", userId.getValue());
                        return new UserNotFoundException("Person not found for user: " + userId.getValue());
                    });

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
            log.error("❌ Failed to fetch minimal user info for User {}: {}", userId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }

    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> getMinimalUserInfoByIds(List<String> userIds) {
        log.debug("📊 Fetching minimal user info for {} user IDs", userIds.size());
        long startTime = System.currentTimeMillis();

        try {
            List<MinimalUserInfoDTO> result = userIds.stream()
                    .map(this::getMinimalUserInfoSafe)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved minimal info for {} users in {}ms", result.size(), duration);

            return result;

        } catch (Exception e) {
            log.error("❌ Failed to fetch minimal user info: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch minimal user info", e);
        }
    }

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

    private boolean matchesSearchQuery(User user, String searchQuery) {
        try {
            Person person = personRepository.findById(user.getPersonId()).orElse(null);
            if (person == null) return false;

            String searchLower = searchQuery.toLowerCase();
            return person.getFullName().toLowerCase().contains(searchLower) ||
                    person.getFirstName().toLowerCase().contains(searchLower) ||
                    person.getLastName().toLowerCase().contains(searchLower);
        } catch (Exception e) {
            log.warn("Error filtering user {}: {}", user.getId().getValue(), e.getMessage());
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
            log.warn("Failed to map user {} to DTO: {}", user.getId().getValue(), e.getMessage());
            return null;
        }
    }

    private MinimalUserInfoDTO getMinimalUserInfoSafe(String userId) {
        try {
            User user = userRepository.findById(UserId.fromString(userId)).orElse(null);
            if (user == null) {
                return new MinimalUserInfoDTO(userId, "unknown", "Unknown", "User", "Unknown User");
            }

            Person person = personRepository.findById(user.getPersonId()).orElse(null);
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
    }
}