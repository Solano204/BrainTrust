package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;


import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class PersonEntityMapper {

    public PersonJpaEntity toEntity(Person person) {
        Address address = person.getAddress();

        return new PersonJpaEntity(
                person.getId().getValue(),
                person.getFirstName(),
                person.getLastName(),
                person.getGender(),
                person.getPhone(),
                person.getRegistrationDate(),
                person.getPathImage(),
                address != null ? address.getStreet() : null,
                address != null ? address.getColony() : null,
                address != null ? address.getMunicipality() : null,
                address != null ? address.getState() : null,
                address != null ? address.getPostalCode() : null
        );
    }

    public Person toDomain(PersonJpaEntity entity) {
        PersonId id = PersonId.fromString(entity.getId());

        Address address = null;
        if (entity.getAddressStreet() != null) {
            address = new Address(
                    entity.getAddressStreet(),
                    entity.getAddressColony(),
                    entity.getAddressMunicipality(),
                    entity.getAddressState(),
                    entity.getAddressPostalCode()
            );
        }

        return Person.reconstitute(
                id,
                entity.getFirstName(),
                entity.getLastName(),
                entity.getGender(),
                entity.getPhone(),
                entity.getRegistrationDate(),
                entity.getImagePath(),
                address
        );
    }
}