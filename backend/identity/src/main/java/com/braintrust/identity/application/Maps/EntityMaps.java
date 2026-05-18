package com.braintrust.identity.application.Maps;

import com.braintrust.identity.application.dtos.dtos.AddressDTO;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.dtos.dtos.catalog.RoleActivityDTO;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Address;

import java.util.List;
import java.util.stream.Collectors;

public final class EntityMaps {

    private EntityMaps() {}

    // ✅ Full version: with Person + activities
    public static UserDTO toUserDTO(User user, Person person, List<RoleActivityDTO> activities) {
        if (user == null) return null;

        PersonDTO personDTO = person != null ? toPersonDTO(person) : null;

        return new UserDTO(
                user.getId().getValue(),
                user.getEmail().getValue(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                personDTO,
                user.getStudentId(),
                activities != null ? activities : List.of()
        );
    }

    // ✅ With Person, no activities (empty list)
    public static UserDTO toUserDTO(User user, Person person) {
        return toUserDTO(user, person, List.of());
    }

    // ✅ No Person, no activities
    public static UserDTO toUserDTO(User user) {
        return toUserDTO(user, null, List.of());
    }

    public static PersonDTO toPersonDTO(Person person) {
        if (person == null) return null;

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

    public static AddressDTO toAddressDTO(Address address) {
        if (address == null) return null;

        return new AddressDTO(
                address.getStreet(),
                address.getColony(),
                address.getMunicipality(),
                address.getState(),
                address.getPostalCode()
        );
    }

    public static List<UserDTO> toUserDTOList(List<User> users) {
        if (users == null) return List.of();

        return users.stream()
                .map(EntityMaps::toUserDTO)
                .collect(Collectors.toList());
    }
}