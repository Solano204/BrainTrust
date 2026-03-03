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

    // ── UserDTO builders ──────────────────────────────────────────────────────

    // Full: con Person + activities
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

    // Con Person, sin activities
    public static UserDTO toUserDTO(User user, Person person) {
        return toUserDTO(user, person, List.of());
    }

    // Sin Person ni activities
    public static UserDTO toUserDTO(User user) {
        return toUserDTO(user, null, List.of());
    }

    // ── PersonDTO builder ─────────────────────────────────────────────────────

    /**
     * Convierte Person (dominio) → PersonDTO.
     * Usa los nuevos campos: primerNombre, segundoNombre, apellidoPaterno,
     * apellidoMaterno, curp, rfc, birthDate, age.
     *
     * tieneUsuario = false por defecto (sin acceso al UserRepository aquí).
     * Si necesitas ese flag, usa el overload toPersonDTO(Person, boolean).
     */
    public static PersonDTO toPersonDTO(Person person) {
        return toPersonDTO(person, false);
    }

    /**
     * Convierte Person (dominio) → PersonDTO con flag tieneUsuario explícito.
     */
    public static PersonDTO toPersonDTO(Person person, boolean tieneUsuario) {
        if (person == null) return null;

        AddressDTO addressDTO = person.getAddress() != null
                ? toAddressDTO(person.getAddress())
                : null;

        return new PersonDTO(
                person.getId().getValue(),
                person.getCurp(),
                person.getRfc(),
                person.getPrimerNombre(),
                person.getSegundoNombre(),
                person.getApellidoPaterno(),
                person.getApellidoMaterno(),
                person.getFullName(),
                person.getGender(),
                person.getPhone(),
                person.getBirthDate() != null ? person.getBirthDate().toString() : null,
                person.getAge(),
                person.getRegistrationDate() != null ? person.getRegistrationDate().toString() : null,
                person.getPathImage(),
                addressDTO,
                tieneUsuario
        );
    }

    // ── AddressDTO builder ────────────────────────────────────────────────────

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

    // ── List helpers ──────────────────────────────────────────────────────────

    public static List<UserDTO> toUserDTOList(List<User> users) {
        if (users == null) return List.of();
        return users.stream()
                .map(EntityMaps::toUserDTO)
                .collect(Collectors.toList());
    }
}