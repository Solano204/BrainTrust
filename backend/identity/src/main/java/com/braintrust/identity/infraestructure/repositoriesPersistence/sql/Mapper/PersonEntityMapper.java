package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.identity.application.services.CatalogService;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PersonEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(PersonEntityMapper.class);

    private final CatalogService catalogService;
    private final CatFirstNameJpaRepository firstNameRepo;
    private final CatLastNameJpaRepository lastNameRepo;
    private final CatStateJpaRepository stateRepo;
    private final CatMunicipalityJpaRepository municipalityRepo;
    private final CatColonyJpaRepository colonyRepo;
    private final CatStreetJpaRepository streetRepo;
    private final CatPostalCodeJpaRepository postalCodeRepo;

    public PersonEntityMapper(
            CatalogService catalogService,
            CatFirstNameJpaRepository firstNameRepo,
            CatLastNameJpaRepository lastNameRepo,
            CatStateJpaRepository stateRepo,
            CatMunicipalityJpaRepository municipalityRepo,
            CatColonyJpaRepository colonyRepo,
            CatStreetJpaRepository streetRepo,
            CatPostalCodeJpaRepository postalCodeRepo) {
        this.catalogService = catalogService;
        this.firstNameRepo = firstNameRepo;
        this.lastNameRepo = lastNameRepo;
        this.stateRepo = stateRepo;
        this.municipalityRepo = municipalityRepo;
        this.colonyRepo = colonyRepo;
        this.streetRepo = streetRepo;
        this.postalCodeRepo = postalCodeRepo;
    }

    /**
     * Domain -> JPA Entity
     * Automatically finds or creates catalog entries for names and address fields.
     */
    public PersonJpaEntity toEntity(Person person) {
        log.debug("Mapping Person Domain ID {} to JPA Entity.", person.getId().getValue());

        // Find or create catalog IDs for name
        Integer firstNameId = catalogService.findOrCreateFirstName(person.getFirstName());
        Integer lastNameId = catalogService.findOrCreateLastName(person.getLastName());

        PersonJpaEntity entity = new PersonJpaEntity();
        entity.setId(person.getId().getValue());
        entity.setFirstNameId(firstNameId);
        entity.setLastNameId(lastNameId);
        entity.setGender(person.getGender());
        entity.setPhone(person.getPhone());
        entity.setRegistrationDate(person.getRegistrationDate());
        entity.setImagePath(person.getPathImage());

        // Handle address catalog IDs
        if (person.getAddress() != null) {
            Address addr = person.getAddress();

            Integer stateId = catalogService.findOrCreateState(addr.getState());
            Integer municipalityId = catalogService.findOrCreateMunicipality(stateId, addr.getMunicipality());
            Integer colonyId = catalogService.findOrCreateColony(municipalityId, addr.getColony());
            Integer streetId = catalogService.findOrCreateStreet(colonyId, addr.getStreet());
            Integer postalCodeId = catalogService.findOrCreatePostalCode(colonyId, addr.getPostalCode());

            entity.setStateId(stateId);
            entity.setMunicipalityId(municipalityId);
            entity.setColonyId(colonyId);
            entity.setStreetId(streetId);
            entity.setPostalCodeId(postalCodeId);
        }

        return entity;
    }

    /**
     * JPA Entity -> Domain
     * Resolves catalog IDs back to string values.
     */
    public Person toDomain(PersonJpaEntity entity) {
        log.debug("Mapping Person JPA Entity {} back to Domain Model.", entity.getId());

        PersonId id = PersonId.fromString(entity.getId());

        // Resolve first/last name from catalogs
        String firstName = entity.getFirstName(); // populated via transient or join
        String lastName = entity.getLastName();

        // Fallback: query catalog if transient not set
        if (firstName == null && entity.getFirstNameId() != null) {
            firstName = firstNameRepo.findById(entity.getFirstNameId())
                    .map(e -> e.getFirstName()).orElse("Unknown");
        }
        if (lastName == null && entity.getLastNameId() != null) {
            lastName = lastNameRepo.findById(entity.getLastNameId())
                    .map(e -> e.getLastName()).orElse("Unknown");
        }

        // Resolve address
        Address address = null;
        if (entity.getStreetId() != null) {
            String street = entity.getAddressStreet();
            String colony = entity.getAddressColony();
            String municipality = entity.getAddressMunicipality();
            String state = entity.getAddressState();
            String postalCode = entity.getAddressPostalCode();

            // Fallback: query catalogs
            if (street == null && entity.getStreetId() != null) {
                street = streetRepo.findById(entity.getStreetId()).map(e -> e.getStreetName()).orElse(null);
            }
            if (colony == null && entity.getColonyId() != null) {
                colony = colonyRepo.findById(entity.getColonyId()).map(e -> e.getColonyName()).orElse(null);
            }
            if (municipality == null && entity.getMunicipalityId() != null) {
                municipality = municipalityRepo.findById(entity.getMunicipalityId())
                        .map(e -> e.getMunicipalityName()).orElse(null);
            }
            if (state == null && entity.getStateId() != null) {
                state = stateRepo.findById(entity.getStateId()).map(e -> e.getStateName()).orElse(null);
            }
            if (postalCode == null && entity.getPostalCodeId() != null) {
                postalCode = postalCodeRepo.findById(entity.getPostalCodeId())
                        .map(e -> e.getPostalCode()).orElse(null);
            }

            if (street != null && postalCode != null) {
                address = new Address(street, colony, municipality, state, postalCode);
            }
        }

        return Person.reconstitute(
                id,
                firstName,
                lastName,
                entity.getGender(),
                entity.getPhone(),
                entity.getRegistrationDate(),
                entity.getImagePath(),
                address
        );
    }
}