package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.identity.application.services.UserApplicationService;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PersonEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(PersonEntityMapper.class);

    /**
     * Converts a Person Domain Model to a JPA Entity.
     */
    public PersonJpaEntity toEntity(Person person) {
        log.debug("Mapping Person Domain ID {} to JPA Entity.", person.getId().getValue());

        Address address = person.getAddress();

        // Use trace level to log potentially sensitive PII data fields being mapped
        log.trace("Mapping PII: Name={}, Phone={}, Address={}",
                person.getFullName(), person.getPhone(), address != null ? address.getStreet() : "N/A");

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

    /**
     * Converts a Person JPA Entity back to a Domain Person model.
     */
    public Person toDomain(PersonJpaEntity entity) {
        log.debug("Mapping Person JPA Entity {} back to Domain Model.", entity.getId());

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
            log.trace("Address reconstituted for Person ID {}.", id.getValue());
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