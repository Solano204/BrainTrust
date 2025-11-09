package com.braintrust.identity.integration.repository;


import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.PersonEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.JpaPersonRepositoryAdapter;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.PersonJpaRepository;
import com.braintrust.identity.integration.config.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
@ContextConfiguration(classes = BrainTrustApplication.class)

@Import({JpaPersonRepositoryAdapter.class, PersonEntityMapper.class})
@DisplayName("Person Repository Integration Tests")
class PersonRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaPersonRepositoryAdapter personRepository;

    @Autowired
    private PersonJpaRepository jpaRepository;

    @BeforeEach
    void setUp() {
        jpaRepository.deleteAll();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve person by ID")
    void shouldSaveAndRetrievePersonById() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        person.updatePersonalInfo("Juan", "Pérez", "Male", "9611234567");

        // When
        Person saved = personRepository.save(person);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        // Verify retrieval
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFirstName()).isEqualTo("Juan");
        assertThat(retrieved.get().getLastName()).isEqualTo("Pérez");
        assertThat(retrieved.get().getGender()).isEqualTo("Male");
        assertThat(retrieved.get().getPhone()).isEqualTo("9611234567");
    }

    @Test
    @DisplayName("Should save person with address")
    void shouldSavePersonWithAddress() {
        // Given
        Person person = Person.create("María", "López");
        Address address = new Address(
                "Avenida Central 123",
                "Centro",
                "Tuxtla Gutiérrez",
                "Chiapas",
                "29000"
        );
        person.updateAddress(address);

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAddress()).isNotNull();
        assertThat(retrieved.get().getAddress().getStreet()).isEqualTo("Avenida Central 123");
        assertThat(retrieved.get().getAddress().getPostalCode()).isEqualTo("29000");
    }

    @Test
    @DisplayName("Should save person with image path")
    void shouldSavePersonWithImagePath() {
        // Given
        Person person = Person.create("Carlos", "González");
        person.updateImage("/images/profiles/carlos.jpg");

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getPathImage()).isEqualTo("/images/profiles/carlos.jpg");
    }

    @Test
    @DisplayName("Should update existing person")
    void shouldUpdateExistingPerson() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Person saved = personRepository.save(person);

        // When
        saved.updatePersonalInfo("Juan Carlos", "Pérez García", "Male", "9619876543");
        Person updated = personRepository.save(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFirstName()).isEqualTo("Juan Carlos");
        assertThat(retrieved.get().getLastName()).isEqualTo("Pérez García");
        assertThat(retrieved.get().getPhone()).isEqualTo("9619876543");
    }

    @Test
    @DisplayName("Should return empty when person not found")
    void shouldReturnEmptyWhenPersonNotFound() {
        // Given
        PersonId nonExistentId = PersonId.generate();

        // When
        Optional<Person> result = personRepository.findById(nonExistentId);

        // Then
        assertThat(result).isEmpty();
    }

    // ========================================
    // ✅ FIND ALL TESTS
    // ========================================

    @Test
    @DisplayName("Should find all persons")
    void shouldFindAllPersons() {
        // Given
        Person person1 = Person.create("Juan", "Pérez");
        Person person2 = Person.create("María", "López");
        Person person3 = Person.create("Carlos", "González");

        personRepository.save(person1);
        personRepository.save(person2);
        personRepository.save(person3);

        // When
        List<Person> results = personRepository.findAll();

        // Then
        assertThat(results).hasSize(3);
        assertThat(results).extracting(Person::getFirstName)
                .containsExactlyInAnyOrder("Juan", "María", "Carlos");
    }

    @Test
    @DisplayName("Should return empty list when no persons exist")
    void shouldReturnEmptyListWhenNoPersonsExist() {
        // When
        List<Person> results = personRepository.findAll();

        // Then
        assertThat(results).isEmpty();
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete person")
    void shouldDeletePerson() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Person saved = personRepository.save(person);

        // When
        personRepository.delete(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should delete person with address")
    void shouldDeletePersonWithAddress() {
        // Given
        Person person = Person.create("María", "López");
        Address address = new Address("Street", "Colony", "Municipality", "State", "12345");
        person.updateAddress(address);
        Person saved = personRepository.save(person);

        // When
        personRepository.delete(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // ✅ ADDRESS PERSISTENCE TESTS
    // ========================================

    @Test
    @DisplayName("Should persist complete address")
    void shouldPersistCompleteAddress() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Address address = new Address(
                "Calle Principal 456",
                "Las Flores",
                "San Cristóbal",
                "Chiapas",
                "29200"
        );
        person.updateAddress(address);

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();

        Address retrievedAddress = retrieved.get().getAddress();
        assertThat(retrievedAddress).isNotNull();
        assertThat(retrievedAddress.getStreet()).isEqualTo("Calle Principal 456");
        assertThat(retrievedAddress.getColony()).isEqualTo("Las Flores");
        assertThat(retrievedAddress.getMunicipality()).isEqualTo("San Cristóbal");
        assertThat(retrievedAddress.getState()).isEqualTo("Chiapas");
        assertThat(retrievedAddress.getPostalCode()).isEqualTo("29200");
        assertThat(retrievedAddress.isComplete()).isTrue();
    }

    @Test
    @DisplayName("Should update address")
    void shouldUpdateAddress() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Address oldAddress = new Address("Old Street", "Colony", "Municipality", "State", "12345");
        person.updateAddress(oldAddress);
        Person saved = personRepository.save(person);

        // When
        Address newAddress = new Address("New Street", "New Colony", "New Municipality", "New State", "54321");
        saved.updateAddress(newAddress);
        personRepository.save(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAddress().getStreet()).isEqualTo("New Street");
        assertThat(retrieved.get().getAddress().getPostalCode()).isEqualTo("54321");
    }

    @Test
    @DisplayName("Should remove address by setting null")
    void shouldRemoveAddressBySettingNull() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Address address = new Address("Street", "Colony", "Municipality", "State", "12345");
        person.updateAddress(address);
        Person saved = personRepository.save(person);

        // When
        saved.updateAddress(null);
        personRepository.save(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAddress()).isNull();
    }

    // ========================================
    // ✅ REGISTRATION DATE TESTS
    // ========================================

    @Test
    @DisplayName("Should persist registration date")
    void shouldPersistRegistrationDate() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        LocalDate registrationDate = person.getRegistrationDate();

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getRegistrationDate()).isEqualTo(registrationDate);
    }

    @Test
    @DisplayName("Should maintain registration date across updates")
    void shouldMaintainRegistrationDateAcrossUpdates() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        LocalDate originalDate = person.getRegistrationDate();
        Person saved = personRepository.save(person);

        // When - Update multiple times
        saved.updatePersonalInfo("New Name", "New Last", "Female", "9999999999");
        personRepository.save(saved);

        saved.updateAddress(new Address("Street", "Colony", "Municipality", "State", "12345"));
        personRepository.save(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getRegistrationDate()).isEqualTo(originalDate);
    }

    // ========================================
    // ✅ TRANSACTIONAL BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should rollback on exception")
    void shouldRollbackOnException() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Person saved = personRepository.save(person);
        long countBefore = jpaRepository.count();

        // When/Then
        try {
            Person retrieved = personRepository.findById(saved.getId()).orElseThrow();
            retrieved.updatePersonalInfo(null, "Last", "Male", "123"); // This should fail
            personRepository.save(retrieved);
            fail("Should have thrown exception");
        } catch (Exception e) {
            // Expected
        }

        // Verify no changes persisted
        assertThat(jpaRepository.count()).isEqualTo(countBefore);
    }

    // ========================================
    // ✅ SPECIAL CHARACTERS TESTS
    // ========================================

    @Test
    @DisplayName("Should handle names with accents and special characters")
    void shouldHandleNamesWithAccentsAndSpecialCharacters() {
        // Given
        Person person = Person.create("José María", "Ñuñez-García");

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFirstName()).isEqualTo("José María");
        assertThat(retrieved.get().getLastName()).isEqualTo("Ñuñez-García");
    }

    @Test
    @DisplayName("Should handle address with special characters")
    void shouldHandleAddressWithSpecialCharacters() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Address address = new Address(
                "Av. José María Morelos y Pavón #123",
                "Niño Artillero",
                "San Cristóbal de las Casas",
                "Chiapas",
                "29200"
        );
        person.updateAddress(address);

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAddress().getStreet())
                .isEqualTo("Av. José María Morelos y Pavón #123");
        assertThat(retrieved.get().getAddress().getColony()).isEqualTo("Niño Artillero");
    }

    // ========================================
    // ✅ MULTIPLE SAVE OPERATIONS TESTS
    // ========================================

    @Test
    @DisplayName("Should handle multiple saves of same person")
    void shouldHandleMultipleSavesOfSamePerson() {
        // Given
        Person person = Person.create("Juan", "Pérez");

        // When - Save multiple times
        Person saved1 = personRepository.save(person);
        Person saved2 = personRepository.save(saved1);
        Person saved3 = personRepository.save(saved2);

        // Then - Should be the same person
        assertThat(saved1.getId()).isEqualTo(saved2.getId());
        assertThat(saved2.getId()).isEqualTo(saved3.getId());

        // Verify only one person exists
        List<Person> all = personRepository.findAll();
        assertThat(all).hasSize(1);
    }

    @Test
    @DisplayName("Should save multiple persons in batch")
    void shouldSaveMultiplePersonsInBatch() {
        // Given
        Person person1 = Person.create("Person1", "Last1");
        Person person2 = Person.create("Person2", "Last2");
        Person person3 = Person.create("Person3", "Last3");

        // When
        personRepository.save(person1);
        personRepository.save(person2);
        personRepository.save(person3);

        // Then
        List<Person> all = personRepository.findAll();
        assertThat(all).hasSize(3);
    }

    // ========================================
    // ✅ FULL NAME TESTS
    // ========================================

    @Test
    @DisplayName("Should maintain full name consistency")
    void shouldMaintainFullNameConsistency() {
        // Given
        Person person = Person.create("Juan", "Pérez");

        // When
        Person saved = personRepository.save(person);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFullName()).isEqualTo("Juan Pérez");
    }

    @Test
    @DisplayName("Should update full name when names change")
    void shouldUpdateFullNameWhenNamesChange() {
        // Given
        Person person = Person.create("Juan", "Pérez");
        Person saved = personRepository.save(person);

        // When
        saved.updatePersonalInfo("Carlos", "González", "Male", "123456");
        personRepository.save(saved);

        // Then
        Optional<Person> retrieved = personRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getFullName()).isEqualTo("Carlos González");
    }
}