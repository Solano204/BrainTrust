package com.braintrust.identity.application.helpers.user;

import com.braintrust.identity.application.dtos.dtos.*;
import com.braintrust.identity.application.dtos.dtos.catalog.RoleActivityDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.CatRoleActivityJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

import static com.braintrust.identity.application.Maps.EntityMaps.toUserDTO;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findPersonByIdOrThrow;
import static com.braintrust.identity.application.Maps.RepositoryHelper.findUserByIdOrThrow;

@Component
public class UserDtoMapper {

    private static final Logger log = LoggerFactory.getLogger(UserDtoMapper.class);

    private final UserRepository               userRepository;
    private final PersonRepository             personRepository;
    private final CatRoleActivityJpaRepository roleActivityRepository;

    public UserDtoMapper(UserRepository userRepository,
                         PersonRepository personRepository,
                         CatRoleActivityJpaRepository roleActivityRepository) {
        this.userRepository        = userRepository;
        this.personRepository      = personRepository;
        this.roleActivityRepository = roleActivityRepository;
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private List<RoleActivityDTO> getActivities(Role role) {
        return roleActivityRepository.findByRoleId(toRoleId(role))
                .stream()
                .map(a -> new RoleActivityDTO(a.getCode(), a.getActivity(), a.getDescription()))
                .toList();
    }

    private Integer toRoleId(Role role) {
        return switch (role) {
            case STUDENT -> 1;
            case TEACHER -> 2;
            case ADMIN   -> 3;
        };
    }

    // ─── UserDTO mappings ─────────────────────────────────────────────────────

    public UserDTO mapToUserDTO(User user, Person person) {
        List<RoleActivityDTO> activities = getActivities(user.getRole());
        return toUserDTO(user, person, activities);
    }

    public UserDTO mapToUserDTO(User user) {
        try {
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            return mapToUserDTO(user, person);
        } catch (Exception e) {
            log.warn("⚠️ Failed to map user {} to DTO, using fallback: {}",
                    user.getId().getValue(), e.getMessage());
            return toUserDTOFallback(user);
        }
    }

    public UserDTO mapToUserDTO(UserId userId) {
        User user = findUserByIdOrThrow(userId, userRepository);
        return mapToUserDTO(user);
    }

    public UserDTO mapToUserDTOSafe(User user) {
        try {
            return mapToUserDTO(user);
        } catch (Exception e) {
            log.warn("⚠️ Using fallback DTO for user {}: {}",
                    user.getId().getValue(), e.getMessage());
            return toUserDTOFallback(user);
        }
    }

    // ─── MinimalUserInfoDTO mappings ──────────────────────────────────────────

    public MinimalUserInfoDTO mapToMinimalUserInfoDTO(User user, Person person) {
        return new MinimalUserInfoDTO(
                user.getId().getValue(),
                person.getId().getValue(),
                person.getPrimerNombre(),          // ✅ nuevo campo
                person.getApellidoPaterno(),        // ✅ nuevo campo
                person.getFullName()
        );
    }

    public MinimalUserInfoDTO mapToMinimalUserInfoDTO(User user) {
        try {
            Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
            return mapToMinimalUserInfoDTO(user, person);
        } catch (Exception e) {
            log.warn("⚠️ Failed to map user {} to MinimalUserInfoDTO: {}",
                    user.getId().getValue(), e.getMessage());
            return toMinimalUserInfoDTOFallback(user.getId().getValue());
        }
    }

    public MinimalUserInfoDTO mapToMinimalUserInfoDTO(UserId userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(
                            "User not found: " + userId.getValue()));
            return mapToMinimalUserInfoDTO(user);
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch user {} for MinimalUserInfoDTO: {}",
                    userId.getValue(), e.getMessage());
            return toMinimalUserInfoDTOFallback(userId.getValue());
        }
    }

    public MinimalUserInfoDTO mapToMinimalUserInfoDTOSafe(UserId userId) {
        try {
            return mapToMinimalUserInfoDTO(userId);
        } catch (Exception e) {
            log.warn("⚠️ Using fallback MinimalUserInfoDTO for user {}: {}",
                    userId.getValue(), e.getMessage());
            return toMinimalUserInfoDTOFallback(userId.getValue());
        }
    }

    // ─── CompleteUserDTO mappings ─────────────────────────────────────────────

    public CompleteUserDTO mapToCompleteUserDTO(User user, Person person) {
        AddressDTO addressDTO = person.getAddress() != null
                ? new AddressDTO(
                person.getAddress().getStreet(),
                person.getAddress().getColony(),
                person.getAddress().getMunicipality(),
                person.getAddress().getState(),
                person.getAddress().getPostalCode())
                : null;

        return new CompleteUserDTO(
                user.getId().getValue(),
                person.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                person.getPrimerNombre(),           // ✅ primer nombre
                person.getApellidoPaterno(),         // ✅ apellido paterno
                person.getGender(),
                person.getPhone(),
                person.getFullName(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO,
                user.getCreatedAt().toString(),
                String.format("%s profile", user.getRole().name().toLowerCase())
        );
    }

    public CompleteUserDTO mapToCompleteUserDTO(User user) {
        Person person = findPersonByIdOrThrow(user.getPersonId(), personRepository);
        return mapToCompleteUserDTO(user, person);
    }

    public CompleteUserDTO mapToCompleteUserDTO(UserId userId) {
        User user = findUserByIdOrThrow(userId, userRepository);
        return mapToCompleteUserDTO(user);
    }

    // ─── Fallbacks ────────────────────────────────────────────────────────────

    private UserDTO toUserDTOFallback(User user) {
        // ✅ PersonDTO ahora tiene 16 parámetros — todos null/false para el fallback
        PersonDTO fallbackPersonDTO = new PersonDTO(
                "unknown",   // id
                null,        // curp
                null,        // rfc
                "Unknown",   // primerNombre
                null,        // segundoNombre
                "User",      // apellidoPaterno
                null,        // apellidoMaterno
                "Unknown User", // nombreCompleto
                null,        // gender
                null,        // phone
                null,        // birthDate
                null,        // age
                null,        // registrationDate
                null,        // imagePath
                null,        // address
                false        // tieneUsuario
        );

        return new UserDTO(
                user.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                fallbackPersonDTO,
                user.getStudentId(),
                List.of()
        );
    }

    private MinimalUserInfoDTO toMinimalUserInfoDTOFallback(String userId) {
        return new MinimalUserInfoDTO(
                userId,
                "unknown",
                "Unknown",
                "User",
                "Unknown User"
        );
    }
}