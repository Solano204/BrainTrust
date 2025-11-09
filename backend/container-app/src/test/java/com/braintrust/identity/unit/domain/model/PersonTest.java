package com.braintrust.identity.unit.domain.model;


import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Person Domain Model Tests")
class PersonTest {

    private static final String VALID_FIRST_NAME = "John";
    private static final String VALID_LAST_NAME = "Doe";
    private static final String VALID_GENDER = "Male";
    private static final String VALID_PHONE = "+52 961 123 4567";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create person with valid data")
    void shouldCreatePersonWithValidData() {
        // When
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);

        // Then
        assertThat(person).isNotNull();
        assertThat(person.getId()).isNotNull();
        assertThat(person.getFirstName()).isEqualTo(VALID_FIRST_NAME);
        assertThat(person.getLastName()).isEqualTo(VALID_LAST_NAME);
        assertThat(person.getRegistrationDate()).isEqualTo(LocalDate.now());
        assertThat(person.getGender()).isNull();
        assertThat(person.getPhone()).isNull();
        assertThat(person.getAddress()).isNull();
        assertThat(person.getPathImage()).isNull();
    }

    @Test
    @DisplayName("Should trim whitespace from names")
    void shouldTrimWhitespaceFromNames() {
        // When
        Person person = Person.create("  John  ", "  Doe  ");

        // Then
        assertThat(person.getFirstName()).isEqualTo("John");
        assertThat(person.getLastName()).isEqualTo("Doe");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when first name is null or blank")
    void shouldThrowExceptionWhenFirstNameIsNullOrBlank(String invalidFirstName) {
        // When/Then
        assertThatThrownBy(() -> Person.create(invalidFirstName, VALID_LAST_NAME))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("First name cannot be null or empty");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when last name is null or blank")
    void shouldThrowExceptionWhenLastNameIsNullOrBlank(String invalidLastName) {
        // When/Then
        assertThatThrownBy(() -> Person.create(VALID_FIRST_NAME, invalidLastName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Last name cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when first name exceeds max length")
    void shouldThrowExceptionWhenFirstNameExceedsMaxLength() {
        // Given
        String longName = "A".repeat(256);

        // When/Then
        assertThatThrownBy(() -> Person.create(longName, VALID_LAST_NAME))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 255 characters");
    }

    @Test
    @DisplayName("Should throw exception when last name exceeds max length")
    void shouldThrowExceptionWhenLastNameExceedsMaxLength() {
        // Given
        String longName = "A".repeat(256);

        // When/Then
        assertThatThrownBy(() -> Person.create(VALID_FIRST_NAME, longName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 255 characters");
    }

    // ========================================
    // ✅ UPDATE PERSONAL INFO TESTS
    // ========================================

    @Test
    @DisplayName("Should update personal info successfully")
    void shouldUpdatePersonalInfoSuccessfully() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);

        // When
        person.updatePersonalInfo("Jane", "Smith", "Female", "+52 961 999 8888");

        // Then
        assertThat(person.getFirstName()).isEqualTo("Jane");
        assertThat(person.getLastName()).isEqualTo("Smith");
        assertThat(person.getGender()).isEqualTo("Female");
        assertThat(person.getPhone()).isEqualTo("+52 961 999 8888");
    }

    @Test
    @DisplayName("Should throw exception when updating with invalid first name")
    void shouldThrowExceptionWhenUpdatingWithInvalidFirstName() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);

        // When/Then
        assertThatThrownBy(() ->
                person.updatePersonalInfo("", VALID_LAST_NAME, VALID_GENDER, VALID_PHONE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("First name cannot be null or empty");
    }

    // ========================================
    // ✅ ADDRESS TESTS
    // ========================================

    @Test
    @DisplayName("Should update address successfully")
    void shouldUpdateAddressSuccessfully() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        Address address = new Address(
                "Calle Principal 123",
                "Centro",
                "Tuxtla Gutiérrez",
                "Chiapas",
                "29000"
        );

        // When
        person.updateAddress(address);

        // Then
        assertThat(person.getAddress()).isNotNull();
        assertThat(person.getAddress()).isEqualTo(address);
        assertThat(person.getAddress().getStreet()).isEqualTo("Calle Principal 123");
        assertThat(person.getAddress().getPostalCode()).isEqualTo("29000");
    }

    @Test
    @DisplayName("Should allow null address")
    void shouldAllowNullAddress() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        Address address = new Address("Street", "Colony", "Municipality", "State", "12345");
        person.updateAddress(address);

        // When
        person.updateAddress(null);

        // Then
        assertThat(person.getAddress()).isNull();
    }

    // ========================================
    // ✅ IMAGE TESTS
    // ========================================

    @Test
    @DisplayName("Should update image path successfully")
    void shouldUpdateImagePathSuccessfully() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        String imagePath = "/images/john-doe.jpg";

        // When
        person.updateImage(imagePath);

        // Then
        assertThat(person.getPathImage()).isEqualTo(imagePath);
    }

    @Test
    @DisplayName("Should allow null image path")
    void shouldAllowNullImagePath() {
        // Given
        Person person = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        person.updateImage("/images/old.jpg");

        // When
        person.updateImage(null);

        // Then
        assertThat(person.getPathImage()).isNull();
    }

    // ========================================
    // ✅ FULL NAME TESTS
    // ========================================

    @Test
    @DisplayName("Should return correct full name")
    void shouldReturnCorrectFullName() {
        // Given
        Person person = Person.create("John", "Doe");

        // When
        String fullName = person.getFullName();

        // Then
        assertThat(fullName).isEqualTo("John Doe");
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute person from persistence")
    void shouldReconstitutePersonFromPersistence() {
        // Given
        PersonId id = PersonId.generate();
        LocalDate registrationDate = LocalDate.now().minusDays(30);
        Address address = new Address(
                "Calle 5 de Mayo",
                "Centro",
                "Tuxtla",
                "Chiapas",
                "29000"
        );
        String imagePath = "/images/profile.jpg";

        // When
        Person person = Person.reconstitute(
                id,
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                VALID_GENDER,
                VALID_PHONE,
                registrationDate,
                imagePath,
                address
        );

        // Then
        assertThat(person.getId()).isEqualTo(id);
        assertThat(person.getFirstName()).isEqualTo(VALID_FIRST_NAME);
        assertThat(person.getLastName()).isEqualTo(VALID_LAST_NAME);
        assertThat(person.getGender()).isEqualTo(VALID_GENDER);
        assertThat(person.getPhone()).isEqualTo(VALID_PHONE);
        assertThat(person.getRegistrationDate()).isEqualTo(registrationDate);
        assertThat(person.getPathImage()).isEqualTo(imagePath);
        assertThat(person.getAddress()).isEqualTo(address);
    }

    @Test
    @DisplayName("Should reconstitute person without optional fields")
    void shouldReconstitutePersonWithoutOptionalFields() {
        // Given
        PersonId id = PersonId.generate();
        LocalDate registrationDate = LocalDate.now();

        // When
        Person person = Person.reconstitute(
                id,
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                null,
                null,
                registrationDate,
                null,
                null
        );

        // Then
        assertThat(person.getId()).isEqualTo(id);
        assertThat(person.getGender()).isNull();
        assertThat(person.getPhone()).isNull();
        assertThat(person.getPathImage()).isNull();
        assertThat(person.getAddress()).isNull();
    }
}