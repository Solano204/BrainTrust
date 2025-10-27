package com.braintrust.identity.application.Maps;// 📍 shared/infrastructure/mapping/EntityMaps.java

import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Address;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper estático para convertir entidades de dominio a DTOs
 * Se puede llamar directamente: EntityMaps.toUserDTO(user, person)
 */
public final class EntityMaps {

    private EntityMaps() {
        // Clase de utilidad - no instanciable
    }

    // 🏢 IDENTITY CONTEXT MAPPERS

    /**
     * Convierte User + Person a UserDTO
     */
    public static UserDTO toUserDTO(User user, Person person) {
        if (user == null) {
            return null;
        }

        PersonDTO personDTO = person != null ? toPersonDTO(person) : null;

        return new UserDTO(
                user.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                personDTO,
                user.getStudentId()
        );
    }

    /**
     * Convierte User a UserDTO (sin Person)
     */
    public static UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }

        return new UserDTO(
                user.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                null, // person es null
                user.getStudentId()
        );
    }

    /**
     * Convierte Person a PersonDTO
     */
    public static PersonDTO toPersonDTO(Person person) {
        if (person == null) {
            return null;
        }

        AddressDTO addressDTO = person.getAddress() != null
                ? toAddressDTO(person.getAddress())
                : null;

        return new PersonDTO(
                person.getId().getValue(),
                person.getFirstName(),
                person.getLastName(),
                person.getFullName(),
                person.getGender(),
                person.getPhone(),
                person.getRegistrationDate().toString(),
                person.getPathImage(),
                addressDTO
        );
    }

    /**
     * Convierte Address a AddressDTO
     */
    public static AddressDTO toAddressDTO(Address address) {
        if (address == null) {
            return null;
        }

        return new AddressDTO(
                address.getStreet(),
                address.getColony(),
                address.getMunicipality(),
                address.getState(),
                address.getPostalCode()
        );
    }

    /**
     * Convierte lista de Users a lista de UserDTOs
     */
    public static List<UserDTO> toUserDTOList(List<User> users) {
        if (users == null) {
            return List.of();
        }

        return users.stream()
                .map(EntityMaps::toUserDTO)
                .collect(Collectors.toList());
    }
}