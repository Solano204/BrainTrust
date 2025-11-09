package com.braintrust.identity.unit.domain.valueobjects;


import com.braintrust.identity.domain.valueobjects.Email;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Email Value Object Tests")
class EmailTest {

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create email with valid format")
    void shouldCreateEmailWithValidFormat() {
        // When
        Email email = new Email("john.doe@example.com");

        // Then
        assertThat(email.getValue()).isEqualTo("john.doe@example.com");
    }

    @Test
    @DisplayName("Should convert email to lowercase")
    void shouldConvertEmailToLowercase() {
        // When
        Email email = new Email("JOHN.DOE@EXAMPLE.COM");

        // Then
        assertThat(email.getValue()).isEqualTo("john.doe@example.com");
    }

    @Test
    @DisplayName("Should trim whitespace")
    void shouldTrimWhitespace() {
        // When
        Email email = new Email("  john.doe@example.com  ");

        // Then
        assertThat(email.getValue()).isEqualTo("john.doe@example.com");
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when email is null or blank")
    void shouldThrowExceptionWhenEmailIsNullOrBlank(String invalidEmail) {
        // When/Then
        assertThatThrownBy(() -> new Email(invalidEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email cannot be null or empty");
    }

    // 📍 EmailTest.java - Líneas 73-84 (Parámetros)

    // 📍 EmailTest.java - Líneas 73-84 (Parámetros)

// Mantenemos tu código, pero la causa del error es que los valores problemáticos
// deben ser re-evaluados contra tu regex.

    @ParameterizedTest
    @ValueSource(strings = {
            "plainaddress",             // No tiene @
            "missing@domain",           // Falta .TLD
            "missing.domain@.com",      // . antes del TLD
            "two@@example.com",         // Doble @
            "email@",                   // Falta el dominio
            "@",                        // Solo @
            "email@domain.",            // Punto al final del dominio
    })
    @DisplayName("Should throw exception for invalid email formats")
    void shouldThrowExceptionForInvalidEmailFormats(String invalidEmail) {
        // When/Then
        assertThatThrownBy(() -> new Email(invalidEmail))
                .isInstanceOf(IllegalArgumentException.class)
                // Añadimos el mensaje de fallo para saber qué valor pasa (si lo hace)
                .withFailMessage("Expected IllegalArgumentException for value: " + invalidEmail)
                .hasMessageContaining("Invalid email format");
    }

    @Test
    @DisplayName("Should throw exception when email exceeds max length")
    void shouldThrowExceptionWhenEmailExceedsMaxLength() {
        // Given
        String longEmail = "a".repeat(250) + "@example.com"; // > 254 chars

        // When/Then
        assertThatThrownBy(() -> new Email(longEmail))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 254 characters");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "user@example.com",
            "user.name@example.com",
            "user+tag@example.co.uk",
            "user_name@example-domain.com",
            "123@example.com",
            "a@b.co"
    })
    @DisplayName("Should accept valid email formats")
    void shouldAcceptValidEmailFormats(String validEmail) {
        // When
        Email email = new Email(validEmail);

        // Then
        assertThat(email.getValue()).isNotNull();
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when values match (case-insensitive)")
    void shouldBeEqualWhenValuesMatch() {
        // Given
        Email email1 = new Email("john.doe@example.com");
        Email email2 = new Email("JOHN.DOE@EXAMPLE.COM");

        // Then
        assertThat(email1).isEqualTo(email2);
        assertThat(email1.hashCode()).isEqualTo(email2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when values differ")
    void shouldNotBeEqualWhenValuesDiffer() {
        // Given
        Email email1 = new Email("john@example.com");
        Email email2 = new Email("jane@example.com");

        // Then
        assertThat(email1).isNotEqualTo(email2);
    }

    @Test
    @DisplayName("Should have valid toString representation")
    void shouldHaveValidToStringRepresentation() {
        // Given
        Email email = new Email("john.doe@example.com");

        // Then
        assertThat(email.toString()).isEqualTo("john.doe@example.com");
    }
}