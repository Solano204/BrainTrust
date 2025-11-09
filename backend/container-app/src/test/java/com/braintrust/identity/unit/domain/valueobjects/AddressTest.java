package com.braintrust.identity.unit.domain.valueobjects;


import com.braintrust.identity.domain.valueobjects.Address;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Address Value Object Tests")
class AddressTest {

    private static final String VALID_STREET = "Calle Principal 123";
    private static final String VALID_COLONY = "Centro";
    private static final String VALID_MUNICIPALITY = "Tuxtla Gutiérrez";
    private static final String VALID_STATE = "Chiapas";
    private static final String VALID_POSTAL_CODE = "29000";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create address with all fields")
    void shouldCreateAddressWithAllFields() {
        // When
        Address address = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address.getStreet()).isEqualTo(VALID_STREET);
        assertThat(address.getColony()).isEqualTo(VALID_COLONY);
        assertThat(address.getMunicipality()).isEqualTo(VALID_MUNICIPALITY);
        assertThat(address.getState()).isEqualTo(VALID_STATE);
        assertThat(address.getPostalCode()).isEqualTo(VALID_POSTAL_CODE);
    }

    @Test
    @DisplayName("Should trim whitespace from street")
    void shouldTrimWhitespaceFromStreet() {
        // When
        Address address = new Address(
                "  Calle Principal 123  ",
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address.getStreet()).isEqualTo("Calle Principal 123");
    }

    @Test
    @DisplayName("Should allow null optional fields")
    void shouldAllowNullOptionalFields() {
        // When
        Address address = new Address(
                VALID_STREET,
                null,
                null,
                null,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address.getStreet()).isEqualTo(VALID_STREET);
        assertThat(address.getColony()).isNull();
        assertThat(address.getMunicipality()).isNull();
        assertThat(address.getState()).isNull();
        assertThat(address.getPostalCode()).isEqualTo(VALID_POSTAL_CODE);
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when street is null or blank")
    void shouldThrowExceptionWhenStreetIsNullOrBlank(String invalidStreet) {
        // When/Then
        assertThatThrownBy(() -> new Address(
                invalidStreet,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Street cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when postal code is null")
    void shouldThrowExceptionWhenPostalCodeIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                null
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Postal code must be 5 digits");
    }

    @ParameterizedTest
    @ValueSource(strings = {"1234", "123456", "ABCDE", "1234A", "12 345"})
    @DisplayName("Should throw exception when postal code is invalid")
    void shouldThrowExceptionWhenPostalCodeIsInvalid(String invalidPostalCode) {
        // When/Then
        assertThatThrownBy(() -> new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                invalidPostalCode
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Postal code must be 5 digits");
    }

    // ========================================
    // ✅ COMPLETENESS TESTS
    // ========================================

    @Test
    @DisplayName("Should be complete when street and postal code are present")
    void shouldBeCompleteWhenStreetAndPostalCodeArePresent() {
        // When
        Address address = new Address(
                VALID_STREET,
                null,
                null,
                null,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address.isComplete()).isTrue();
    }

    @Test
    @DisplayName("Should be complete when all fields are present")
    void shouldBeCompleteWhenAllFieldsArePresent() {
        // When
        Address address = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address.isComplete()).isTrue();
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when all fields match")
    void shouldBeEqualWhenAllFieldsMatch() {
        // Given
        Address address1 = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );
        Address address2 = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address1).isEqualTo(address2);
        assertThat(address1.hashCode()).isEqualTo(address2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when street differs")
    void shouldNotBeEqualWhenStreetDiffers() {
        // Given
        Address address1 = new Address(
                "Calle 1",
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );
        Address address2 = new Address(
                "Calle 2",
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                VALID_POSTAL_CODE
        );

        // Then
        assertThat(address1).isNotEqualTo(address2);
    }

    @Test
    @DisplayName("Should not be equal when postal code differs")
    void shouldNotBeEqualWhenPostalCodeDiffers() {
        // Given
        Address address1 = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                "29000"
        );
        Address address2 = new Address(
                VALID_STREET,
                VALID_COLONY,
                VALID_MUNICIPALITY,
                VALID_STATE,
                "29100"
        );

        // Then
        assertThat(address1).isNotEqualTo(address2);
    }
}