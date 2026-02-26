package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.dtos.catalog.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.braintrust.identity.domain.exceptions.CatalogInUseException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CatalogService {

    private static final Logger log = LoggerFactory.getLogger(CatalogService.class);

    private final CatFirstNameJpaRepository firstNameRepo;
    private final CatLastNameJpaRepository lastNameRepo;
    private final CatStateJpaRepository stateRepo;
    private final CatMunicipalityJpaRepository municipalityRepo;
    private final CatColonyJpaRepository colonyRepo;
    private final CatStreetJpaRepository streetRepo;
    private final CatPostalCodeJpaRepository postalCodeRepo;

    public CatalogService(
            CatFirstNameJpaRepository firstNameRepo,
            CatLastNameJpaRepository lastNameRepo,
            CatStateJpaRepository stateRepo,
            CatMunicipalityJpaRepository municipalityRepo,
            CatColonyJpaRepository colonyRepo,
            CatStreetJpaRepository streetRepo,
            CatPostalCodeJpaRepository postalCodeRepo) {
        this.firstNameRepo = firstNameRepo;
        this.lastNameRepo = lastNameRepo;
        this.stateRepo = stateRepo;
        this.municipalityRepo = municipalityRepo;
        this.colonyRepo = colonyRepo;
        this.streetRepo = streetRepo;
        this.postalCodeRepo = postalCodeRepo;
    }

    // ==================== FIRST NAMES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogItemDTO> getAllFirstNames(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        Page<CatFirstNameJpaEntity> result = (search != null && !search.isBlank())
                ? firstNameRepo.findByFirstNameContainingIgnoreCase(search.trim(), pageable)
                : firstNameRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogItemDTO(e.getId(), e.getFirstName()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    /** Finds or creates a first name. Returns the id. */
    public Integer findOrCreateFirstName(String firstName) {
        return firstNameRepo.findByFirstNameIgnoreCase(firstName.trim())
                .map(CatFirstNameJpaEntity::getId)
                .orElseGet(() -> {
                    CatFirstNameJpaEntity entity = new CatFirstNameJpaEntity(capitalize(firstName));
                    return firstNameRepo.save(entity).getId();
                });
    }

    public CatalogItemDTO addFirstName(String firstName) {
        String trimmed = capitalize(firstName.trim());
        CatFirstNameJpaEntity entity = firstNameRepo.findByFirstNameIgnoreCase(trimmed)
                .orElseGet(() -> firstNameRepo.save(new CatFirstNameJpaEntity(trimmed)));
        return new CatalogItemDTO(entity.getId(), entity.getFirstName());
    }

    public CatalogItemDTO updateFirstName(Integer id, String newName) {
        CatFirstNameJpaEntity entity = firstNameRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("First name not found: " + id));

        long usageCount = firstNameRepo.countPersonsByFirstNameId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot update first name '" + entity.getFirstName() +
                    "': used by " + usageCount + " person(s)");
        }

        entity.setFirstName(capitalize(newName.trim()));
        return new CatalogItemDTO(entity.getId(), firstNameRepo.save(entity).getFirstName());
    }

    public void deleteFirstName(Integer id) {
        CatFirstNameJpaEntity entity = firstNameRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("First name not found: " + id));

        long usageCount = firstNameRepo.countPersonsByFirstNameId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot delete first name '" + entity.getFirstName() +
                    "': used by " + usageCount + " person(s)");
        }
        firstNameRepo.deleteById(id);
    }

    // ==================== LAST NAMES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogItemDTO> getAllLastNames(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("lastName").ascending());
        Page<CatLastNameJpaEntity> result = (search != null && !search.isBlank())
                ? lastNameRepo.findByLastNameContainingIgnoreCase(search.trim(), pageable)
                : lastNameRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogItemDTO(e.getId(), e.getLastName()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreateLastName(String lastName) {
        return lastNameRepo.findByLastNameIgnoreCase(lastName.trim())
                .map(CatLastNameJpaEntity::getId)
                .orElseGet(() -> {
                    CatLastNameJpaEntity entity = new CatLastNameJpaEntity(capitalize(lastName));
                    return lastNameRepo.save(entity).getId();
                });
    }

    public CatalogItemDTO addLastName(String lastName) {
        String trimmed = capitalize(lastName.trim());
        CatLastNameJpaEntity entity = lastNameRepo.findByLastNameIgnoreCase(trimmed)
                .orElseGet(() -> lastNameRepo.save(new CatLastNameJpaEntity(trimmed)));
        return new CatalogItemDTO(entity.getId(), entity.getLastName());
    }

    public CatalogItemDTO updateLastName(Integer id, String newName) {
        CatLastNameJpaEntity entity = lastNameRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Last name not found: " + id));

        long usageCount = lastNameRepo.countPersonsByLastNameId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot update last name '" + entity.getLastName() +
                    "': used by " + usageCount + " person(s)");
        }

        entity.setLastName(capitalize(newName.trim()));
        return new CatalogItemDTO(entity.getId(), lastNameRepo.save(entity).getLastName());
    }

    public void deleteLastName(Integer id) {
        CatLastNameJpaEntity entity = lastNameRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Last name not found: " + id));

        long usageCount = lastNameRepo.countPersonsByLastNameId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot delete last name '" + entity.getLastName() +
                    "': used by " + usageCount + " person(s)");
        }
        lastNameRepo.deleteById(id);
    }

    // ==================== STATES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogItemDTO> getAllStates(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("stateName").ascending());
        Page<CatStateJpaEntity> result = (search != null && !search.isBlank())
                ? stateRepo.findByStateNameContainingIgnoreCase(search.trim(), pageable)
                : stateRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogItemDTO(e.getId(), e.getStateName()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreateState(String stateName) {
        return stateRepo.findByStateNameIgnoreCase(stateName.trim())
                .map(CatStateJpaEntity::getId)
                .orElseGet(() -> stateRepo.save(new CatStateJpaEntity(stateName.trim())).getId());
    }

    public CatalogItemDTO addState(String stateName) {
        String trimmed = stateName.trim();
        CatStateJpaEntity entity = stateRepo.findByStateNameIgnoreCase(trimmed)
                .orElseGet(() -> stateRepo.save(new CatStateJpaEntity(trimmed)));
        return new CatalogItemDTO(entity.getId(), entity.getStateName());
    }

    public CatalogItemDTO updateState(Integer id, String newName) {
        CatStateJpaEntity entity = stateRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("State not found: " + id));

        long personUsage = stateRepo.countPersonsByStateId(id);
        long municipalityUsage = stateRepo.countMunicipalitiesByStateId(id);
        if (personUsage > 0 || municipalityUsage > 0) {
            throw new CatalogInUseException("Cannot update state: has " + personUsage + " person(s) and " +
                    municipalityUsage + " municipality(ies) depending on it");
        }

        entity.setStateName(newName.trim());
        return new CatalogItemDTO(entity.getId(), stateRepo.save(entity).getStateName());
    }

    public void deleteState(Integer id) {
        CatStateJpaEntity entity = stateRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("State not found: " + id));

        long personUsage = stateRepo.countPersonsByStateId(id);
        long municipalityUsage = stateRepo.countMunicipalitiesByStateId(id);
        if (personUsage > 0 || municipalityUsage > 0) {
            throw new CatalogInUseException("Cannot delete state: has " + personUsage + " person(s) and " +
                    municipalityUsage + " municipality(ies) depending on it");
        }
        stateRepo.deleteById(id);
    }

    // ==================== MUNICIPALITIES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogMunicipalityDTO> getAllMunicipalities(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("municipalityName").ascending());
        Page<CatMunicipalityJpaEntity> result = (search != null && !search.isBlank())
                ? municipalityRepo.findByMunicipalityNameContainingIgnoreCase(search.trim(), pageable)
                : municipalityRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogMunicipalityDTO(e.getId(), e.getMunicipalityName(), e.getStateId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogMunicipalityDTO> getMunicipalitiesByState(Integer stateId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("municipalityName").ascending());
        Page<CatMunicipalityJpaEntity> result = municipalityRepo.findByStateId(stateId, pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogMunicipalityDTO(e.getId(), e.getMunicipalityName(), e.getStateId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreateMunicipality(Integer stateId, String municipalityName) {
        return municipalityRepo.findByStateIdAndMunicipalityNameIgnoreCase(stateId, municipalityName.trim())
                .map(CatMunicipalityJpaEntity::getId)
                .orElseGet(() -> {
                    CatMunicipalityJpaEntity entity = new CatMunicipalityJpaEntity();
                    entity.setStateId(stateId);
                    entity.setMunicipalityName(municipalityName.trim());
                    return municipalityRepo.save(entity).getId();
                });
    }

    public CatalogMunicipalityDTO addMunicipality(Integer stateId, String municipalityName) {
        String trimmed = municipalityName.trim();
        CatMunicipalityJpaEntity entity = municipalityRepo
                .findByStateIdAndMunicipalityNameIgnoreCase(stateId, trimmed)
                .orElseGet(() -> {
                    CatMunicipalityJpaEntity m = new CatMunicipalityJpaEntity();
                    m.setStateId(stateId);
                    m.setMunicipalityName(trimmed);
                    return municipalityRepo.save(m);
                });
        return new CatalogMunicipalityDTO(entity.getId(), entity.getMunicipalityName(), entity.getStateId());
    }

    public CatalogMunicipalityDTO updateMunicipality(Integer id, String newName) {
        CatMunicipalityJpaEntity entity = municipalityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Municipality not found: " + id));

        long personUsage = municipalityRepo.countPersonsByMunicipalityId(id);
        long colonyUsage = municipalityRepo.countColoniesByMunicipalityId(id);
        if (personUsage > 0 || colonyUsage > 0) {
            throw new CatalogInUseException("Cannot update municipality: has " + personUsage + " person(s) and " +
                    colonyUsage + " colony(ies) depending on it");
        }

        entity.setMunicipalityName(newName.trim());
        CatMunicipalityJpaEntity saved = municipalityRepo.save(entity);
        return new CatalogMunicipalityDTO(saved.getId(), saved.getMunicipalityName(), saved.getStateId());
    }

    public void deleteMunicipality(Integer id) {
        CatMunicipalityJpaEntity entity = municipalityRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Municipality not found: " + id));

        long personUsage = municipalityRepo.countPersonsByMunicipalityId(id);
        long colonyUsage = municipalityRepo.countColoniesByMunicipalityId(id);
        if (personUsage > 0 || colonyUsage > 0) {
            throw new CatalogInUseException("Cannot delete municipality: has " + personUsage + " person(s) and " +
                    colonyUsage + " colony(ies) depending on it");
        }
        municipalityRepo.deleteById(id);
    }

    // ==================== COLONIES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogColonyDTO> getAllColonies(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("colonyName").ascending());
        Page<CatColonyJpaEntity> result = (search != null && !search.isBlank())
                ? colonyRepo.findByColonyNameContainingIgnoreCase(search.trim(), pageable)
                : colonyRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogColonyDTO(e.getId(), e.getColonyName(), e.getMunicipalityId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogColonyDTO> getColoniesByMunicipality(Integer municipalityId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("colonyName").ascending());
        Page<CatColonyJpaEntity> result = colonyRepo.findByMunicipalityId(municipalityId, pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogColonyDTO(e.getId(), e.getColonyName(), e.getMunicipalityId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreateColony(Integer municipalityId, String colonyName) {
        return colonyRepo.findByMunicipalityIdAndColonyNameIgnoreCase(municipalityId, colonyName.trim())
                .map(CatColonyJpaEntity::getId)
                .orElseGet(() -> {
                    CatColonyJpaEntity entity = new CatColonyJpaEntity();
                    entity.setMunicipalityId(municipalityId);
                    entity.setColonyName(colonyName.trim());
                    return colonyRepo.save(entity).getId();
                });
    }

    public CatalogColonyDTO addColony(Integer municipalityId, String colonyName) {
        String trimmed = colonyName.trim();
        CatColonyJpaEntity entity = colonyRepo
                .findByMunicipalityIdAndColonyNameIgnoreCase(municipalityId, trimmed)
                .orElseGet(() -> {
                    CatColonyJpaEntity c = new CatColonyJpaEntity();
                    c.setMunicipalityId(municipalityId);
                    c.setColonyName(trimmed);
                    return colonyRepo.save(c);
                });
        return new CatalogColonyDTO(entity.getId(), entity.getColonyName(), entity.getMunicipalityId());
    }

    public CatalogColonyDTO updateColony(Integer id, String newName) {
        CatColonyJpaEntity entity = colonyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Colony not found: " + id));

        long personUsage = colonyRepo.countPersonsByColonyId(id);
        long streetUsage = colonyRepo.countStreetsByColonyId(id);
        if (personUsage > 0 || streetUsage > 0) {
            throw new CatalogInUseException("Cannot update colony: has " + personUsage + " person(s) and " +
                    streetUsage + " street(s) depending on it");
        }

        entity.setColonyName(newName.trim());
        CatColonyJpaEntity saved = colonyRepo.save(entity);
        return new CatalogColonyDTO(saved.getId(), saved.getColonyName(), saved.getMunicipalityId());
    }

    public void deleteColony(Integer id) {
        CatColonyJpaEntity entity = colonyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Colony not found: " + id));

        long personUsage = colonyRepo.countPersonsByColonyId(id);
        long streetUsage = colonyRepo.countStreetsByColonyId(id);
        if (personUsage > 0 || streetUsage > 0) {
            throw new CatalogInUseException("Cannot delete colony: has " + personUsage + " person(s) and " +
                    streetUsage + " street(s) depending on it");
        }
        colonyRepo.deleteById(id);
    }

    // ==================== STREETS ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogStreetDTO> getAllStreets(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("streetName").ascending());
        Page<CatStreetJpaEntity> result = (search != null && !search.isBlank())
                ? streetRepo.findByStreetNameContainingIgnoreCase(search.trim(), pageable)
                : streetRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogStreetDTO(e.getId(), e.getStreetName(), e.getColonyId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogStreetDTO> getStreetsByColony(Integer colonyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("streetName").ascending());
        Page<CatStreetJpaEntity> result = streetRepo.findByColonyId(colonyId, pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogStreetDTO(e.getId(), e.getStreetName(), e.getColonyId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreateStreet(Integer colonyId, String streetName) {
        return streetRepo.findByColonyIdAndStreetNameIgnoreCase(colonyId, streetName.trim())
                .map(CatStreetJpaEntity::getId)
                .orElseGet(() -> {
                    CatStreetJpaEntity entity = new CatStreetJpaEntity();
                    entity.setColonyId(colonyId);
                    entity.setStreetName(streetName.trim());
                    return streetRepo.save(entity).getId();
                });
    }

    public CatalogStreetDTO addStreet(Integer colonyId, String streetName) {
        String trimmed = streetName.trim();
        CatStreetJpaEntity entity = streetRepo
                .findByColonyIdAndStreetNameIgnoreCase(colonyId, trimmed)
                .orElseGet(() -> {
                    CatStreetJpaEntity s = new CatStreetJpaEntity();
                    s.setColonyId(colonyId);
                    s.setStreetName(trimmed);
                    return streetRepo.save(s);
                });
        return new CatalogStreetDTO(entity.getId(), entity.getStreetName(), entity.getColonyId());
    }

    public CatalogStreetDTO updateStreet(Integer id, String newName) {
        CatStreetJpaEntity entity = streetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Street not found: " + id));

        long usageCount = streetRepo.countPersonsByStreetId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot update street '" + entity.getStreetName() +
                    "': used by " + usageCount + " person(s)");
        }

        entity.setStreetName(newName.trim());
        CatStreetJpaEntity saved = streetRepo.save(entity);
        return new CatalogStreetDTO(saved.getId(), saved.getStreetName(), saved.getColonyId());
    }

    public void deleteStreet(Integer id) {
        CatStreetJpaEntity entity = streetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Street not found: " + id));

        long usageCount = streetRepo.countPersonsByStreetId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot delete street '" + entity.getStreetName() +
                    "': used by " + usageCount + " person(s)");
        }
        streetRepo.deleteById(id);
    }

    // ==================== POSTAL CODES ====================

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogPostalCodeDTO> getAllPostalCodes(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postalCode").ascending());
        Page<CatPostalCodeJpaEntity> result = (search != null && !search.isBlank())
                ? postalCodeRepo.findByPostalCodeContaining(search.trim(), pageable)
                : postalCodeRepo.findAll(pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogPostalCodeDTO(e.getId(), e.getPostalCode(), e.getColonyId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<CatalogPostalCodeDTO> getPostalCodesByColony(Integer colonyId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postalCode").ascending());
        Page<CatPostalCodeJpaEntity> result = postalCodeRepo.findByColonyId(colonyId, pageable);
        return PagedResponseDTO.of(
                result.getContent().stream()
                        .map(e -> new CatalogPostalCodeDTO(e.getId(), e.getPostalCode(), e.getColonyId()))
                        .collect(Collectors.toList()),
                page, size, result.getTotalElements());
    }

    public Integer findOrCreatePostalCode(Integer colonyId, String postalCode) {
        return postalCodeRepo.findByColonyIdAndPostalCode(colonyId, postalCode.trim())
                .map(CatPostalCodeJpaEntity::getId)
                .orElseGet(() -> {
                    CatPostalCodeJpaEntity entity = new CatPostalCodeJpaEntity();
                    entity.setColonyId(colonyId);
                    entity.setPostalCode(postalCode.trim());
                    return postalCodeRepo.save(entity).getId();
                });
    }

    public CatalogPostalCodeDTO addPostalCode(Integer colonyId, String postalCode) {
        String trimmed = postalCode.trim();
        CatPostalCodeJpaEntity entity = postalCodeRepo
                .findByColonyIdAndPostalCode(colonyId, trimmed)
                .orElseGet(() -> {
                    CatPostalCodeJpaEntity p = new CatPostalCodeJpaEntity();
                    p.setColonyId(colonyId);
                    p.setPostalCode(trimmed);
                    return postalCodeRepo.save(p);
                });
        return new CatalogPostalCodeDTO(entity.getId(), entity.getPostalCode(), entity.getColonyId());
    }

    public CatalogPostalCodeDTO updatePostalCode(Integer id, String newCode) {
        CatPostalCodeJpaEntity entity = postalCodeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Postal code not found: " + id));

        long usageCount = postalCodeRepo.countPersonsByPostalCodeId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot update postal code '" + entity.getPostalCode() +
                    "': used by " + usageCount + " person(s)");
        }

        entity.setPostalCode(newCode.trim());
        CatPostalCodeJpaEntity saved = postalCodeRepo.save(entity);
        return new CatalogPostalCodeDTO(saved.getId(), saved.getPostalCode(), saved.getColonyId());
    }

    public void deletePostalCode(Integer id) {
        CatPostalCodeJpaEntity entity = postalCodeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Postal code not found: " + id));

        long usageCount = postalCodeRepo.countPersonsByPostalCodeId(id);
        if (usageCount > 0) {
            throw new CatalogInUseException("Cannot delete postal code '" + entity.getPostalCode() +
                    "': used by " + usageCount + " person(s)");
        }
        postalCodeRepo.deleteById(id);
    }

    // ==================== HELPER ====================
    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}