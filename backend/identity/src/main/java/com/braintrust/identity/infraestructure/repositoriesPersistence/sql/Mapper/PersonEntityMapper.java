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

/**
 * Mapper entre Person (dominio) y PersonJpaEntity.
 *
 * Cambios:
 * - Ahora mapea primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno
 * - Mapea curp, rfc, birthDate, age (age es de solo lectura desde DB)
 */
@Component
public class PersonEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(PersonEntityMapper.class);

    private final CatalogService catalogService;
    private final CatFirstNameJpaRepository        firstNameRepo;
    private final CatSecondNameJpaRepository       secondNameRepo;
    private final CatPaternalLastnameJpaRepository paternalLastnameRepo;
    private final CatMaternalLastnameJpaRepository maternalLastnameRepo;
    private final CatStateJpaRepository            stateRepo;
    private final CatMunicipalityJpaRepository     municipalityRepo;
    private final CatColonyJpaRepository           colonyRepo;
    private final CatStreetJpaRepository           streetRepo;
    private final CatPostalCodeJpaRepository       postalCodeRepo;

    public PersonEntityMapper(
            CatalogService catalogService,
            CatFirstNameJpaRepository firstNameRepo,
            CatSecondNameJpaRepository secondNameRepo,
            CatPaternalLastnameJpaRepository paternalLastnameRepo,
            CatMaternalLastnameJpaRepository maternalLastnameRepo,
            CatStateJpaRepository stateRepo,
            CatMunicipalityJpaRepository municipalityRepo,
            CatColonyJpaRepository colonyRepo,
            CatStreetJpaRepository streetRepo,
            CatPostalCodeJpaRepository postalCodeRepo) {
        this.catalogService        = catalogService;
        this.firstNameRepo         = firstNameRepo;
        this.secondNameRepo        = secondNameRepo;
        this.paternalLastnameRepo  = paternalLastnameRepo;
        this.maternalLastnameRepo  = maternalLastnameRepo;
        this.stateRepo             = stateRepo;
        this.municipalityRepo      = municipalityRepo;
        this.colonyRepo            = colonyRepo;
        this.streetRepo            = streetRepo;
        this.postalCodeRepo        = postalCodeRepo;
    }

    // ── Domain → JPA Entity ──────────────────────────────────────────────────

    public PersonJpaEntity toEntity(Person person) {
        log.debug("Mapping Person Domain ID {} to JPA Entity.", person.getId().getValue());

        Integer primerNombreId    = catalogService.findOrCreateFirstName(person.getPrimerNombre());
        Integer segundoNombreId   = catalogService.findOrCreateSecondName(person.getSegundoNombre());
        Integer apellidoPaternoId = catalogService.findOrCreatePaternalLastname(person.getApellidoPaterno());
        Integer apellidoMaternoId = catalogService.findOrCreateMaternalLastname(person.getApellidoMaterno());

        PersonJpaEntity entity = new PersonJpaEntity();
        entity.setId(person.getId().getValue());
        entity.setPrimerNombreId(primerNombreId);
        entity.setSegundoNombreId(segundoNombreId);
        entity.setApellidoPaternoId(apellidoPaternoId);
        entity.setApellidoMaternoId(apellidoMaternoId);

        // CURP y RFC — solo se asignan en INSERT (la DB previene cambios vía trigger)
        entity.setCurp(person.getCurp());
        entity.setRfc(person.getRfc());

        // birthDate: se asigna directamente si la DB no usa trigger,
        // pero el trigger de PostgreSQL lo calculará del CURP automáticamente.
        entity.setBirthDate(person.getBirthDate());
        // age es GENERATED ALWAYS → no se setea, la DB lo calcula

        entity.setGender(person.getGender());
        entity.setPhone(person.getPhone());
        entity.setRegistrationDate(person.getRegistrationDate());
        entity.setImagePath(person.getPathImage());

        if (person.getAddress() != null) {
            Address addr = person.getAddress();
            Integer stateId        = catalogService.findOrCreateState(addr.getState());
            Integer municipalityId = catalogService.findOrCreateMunicipality(stateId, addr.getMunicipality());
            Integer colonyId       = catalogService.findOrCreateColony(municipalityId, addr.getColony());
            Integer streetId       = catalogService.findOrCreateStreet(colonyId, addr.getStreet());
            Integer postalCodeId   = catalogService.findOrCreatePostalCode(colonyId, addr.getPostalCode());

            entity.setStateId(stateId);
            entity.setMunicipalityId(municipalityId);
            entity.setColonyId(colonyId);
            entity.setStreetId(streetId);
            entity.setPostalCodeId(postalCodeId);
        }

        return entity;
    }

    // ── JPA Entity → Domain ──────────────────────────────────────────────────

    public Person toDomain(PersonJpaEntity entity) {
        log.debug("Mapping Person JPA Entity {} back to Domain Model.", entity.getId());

        PersonId id = PersonId.fromString(entity.getId());

        // Resolver primer nombre
        String primerNombre = entity.getPrimerNombre();
        if (primerNombre == null && entity.getPrimerNombreId() != null) {
            primerNombre = firstNameRepo.findById(entity.getPrimerNombreId())
                    .map(e -> e.getFirstName()).orElse("Desconocido");
        }

        // Resolver segundo nombre (opcional)
        String segundoNombre = entity.getSegundoNombre();
        if (segundoNombre == null && entity.getSegundoNombreId() != null) {
            segundoNombre = secondNameRepo.findById(entity.getSegundoNombreId())
                    .map(e -> e.getSecondName()).orElse(null);
        }

        // Resolver apellido paterno
        String apellidoPaterno = entity.getApellidoPaterno();
        if (apellidoPaterno == null && entity.getApellidoPaternoId() != null) {
            apellidoPaterno = paternalLastnameRepo.findById(entity.getApellidoPaternoId())
                    .map(e -> e.getPaternalLastname()).orElse("Desconocido");
        }

        // Resolver apellido materno (opcional)
        String apellidoMaterno = entity.getApellidoMaterno();
        if (apellidoMaterno == null && entity.getApellidoMaternoId() != null) {
            apellidoMaterno = maternalLastnameRepo.findById(entity.getApellidoMaternoId())
                    .map(e -> e.getMaternalLastname()).orElse(null);
        }

        // Dirección
        Address address = resolveAddress(entity);

        return Person.reconstitute(
                id,
                primerNombre   != null ? primerNombre   : "Desconocido",
                segundoNombre,
                apellidoPaterno != null ? apellidoPaterno : "Desconocido",
                apellidoMaterno,
                entity.getCurp(),
                entity.getRfc(),
                entity.getBirthDate(),
                entity.getAge(),
                entity.getGender(),
                entity.getPhone(),
                entity.getRegistrationDate(),
                entity.getImagePath(),
                address
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Address resolveAddress(PersonJpaEntity entity) {
        if (entity.getStreetId() == null) return null;

        String street       = entity.getAddressStreet();
        String colony       = entity.getAddressColony();
        String municipality = entity.getAddressMunicipality();
        String state        = entity.getAddressState();
        String postalCode   = entity.getAddressPostalCode();

        if (street == null && entity.getStreetId() != null)
            street = streetRepo.findById(entity.getStreetId())
                    .map(e -> e.getStreetName()).orElse(null);
        if (colony == null && entity.getColonyId() != null)
            colony = colonyRepo.findById(entity.getColonyId())
                    .map(e -> e.getColonyName()).orElse(null);
        if (municipality == null && entity.getMunicipalityId() != null)
            municipality = municipalityRepo.findById(entity.getMunicipalityId())
                    .map(e -> e.getMunicipalityName()).orElse(null);
        if (state == null && entity.getStateId() != null)
            state = stateRepo.findById(entity.getStateId())
                    .map(e -> e.getStateName()).orElse(null);
        if (postalCode == null && entity.getPostalCodeId() != null)
            postalCode = postalCodeRepo.findById(entity.getPostalCodeId())
                    .map(e -> e.getPostalCode()).orElse(null);

        if (street != null && postalCode != null) {
            return new Address(street, colony, municipality, state, postalCode);
        }
        return null;
    }
}