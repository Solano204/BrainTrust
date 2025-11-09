package com.braintrust.identity.unit.domain.valueobjects;


import com.braintrust.identity.domain.valueobjects.Password;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Password Value Object Tests")
class PasswordTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create password from plain text")
    void shouldCreatePasswordFromPlainText() {
        // Given
        String plainPassword = "SecurePassword123!";

        // When
        Password password = Password.create(plainPassword, passwordEncoder);

        // Then
        assertThat(password).isNotNull();
        assertThat(password.getHash()).isNotNull();
        assertThat(password.getHash()).isNotEqualTo(plainPassword);
        assertThat(password.getHash()).startsWith("$2a$"); // BCrypt format
    }

    @Test
    @DisplayName("Should create password from hash")
    void shouldCreatePasswordFromHash() {
        // Given
        String hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

        // When
        Password password = Password.fromHash(hash);

        // Then
        assertThat(password).isNotNull();
        assertThat(password.getHash()).isEqualTo(hash);
    }

    @Test
    @DisplayName("Should throw exception when creating from null hash")
    void shouldThrowExceptionWhenCreatingFromNullHash() {
        // When/Then
        assertThatThrownBy(() -> Password.fromHash(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Password hash cannot be null");
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should throw exception when plain password is null")
    void shouldThrowExceptionWhenPlainPasswordIsNull() {
        // When/Then
        assertThatThrownBy(() -> Password.create(null, passwordEncoder))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password must be at least 8 characters");
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "1", "12", "123", "1234", "12345", "123456", "1234567"})
    @DisplayName("Should throw exception when password is less than 8 characters")
    void shouldThrowExceptionWhenPasswordIsLessThan8Characters(String shortPassword) {
        // When/Then
        assertThatThrownBy(() -> Password.create(shortPassword, passwordEncoder))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password must be at least 8 characters");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345678",
            "abcdefgh",
            "Password1",
            "MySecureP@ss",
            "VeryLongPasswordWithMoreThan8Characters123!"
    })
    @DisplayName("Should accept valid passwords with 8 or more characters")
    void shouldAcceptValidPasswordsWith8OrMoreCharacters(String validPassword) {
        // When
        Password password = Password.create(validPassword, passwordEncoder);

        // Then
        assertThat(password).isNotNull();
        assertThat(password.getHash()).isNotNull();
    }

    // ========================================
    // ✅ MATCHING TESTS
    // ========================================

    @Test
    @DisplayName("Should match correct plain password")
    void shouldMatchCorrectPlainPassword() {
        // Given
        String plainPassword = "MySecurePassword123!";
        Password password = Password.create(plainPassword, passwordEncoder);

        // When
        boolean matches = password.matches(plainPassword, passwordEncoder);

        // Then
        assertThat(matches).isTrue();
    }

    @Test
    @DisplayName("Should not match incorrect plain password")
    void shouldNotMatchIncorrectPlainPassword() {
        // Given
        String plainPassword = "MySecurePassword123!";
        Password password = Password.create(plainPassword, passwordEncoder);

        // When
        boolean matches = password.matches("WrongPassword", passwordEncoder);

        // Then
        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("Should not match when case differs")
    void shouldNotMatchWhenCaseDiffers() {
        // Given
        String plainPassword = "MySecurePassword";
        Password password = Password.create(plainPassword, passwordEncoder);

        // When
        boolean matches = password.matches("mysecurepassword", passwordEncoder);

        // Then
        assertThat(matches).isFalse();
    }

    @Test
    @DisplayName("Should not match when extra characters are added")
    void shouldNotMatchWhenExtraCharactersAreAdded() {
        // Given
        String plainPassword = "MyPassword";
        Password password = Password.create(plainPassword, passwordEncoder);

        // When
        boolean matches = password.matches("MyPassword123", passwordEncoder);

        // Then
        assertThat(matches).isFalse();
    }

    // ========================================
    // ✅ HASH UNIQUENESS TESTS
    // ========================================

    @Test
    @DisplayName("Should generate different hashes for same password")
    void shouldGenerateDifferentHashesForSamePassword() {
        // Given
        String plainPassword = "SamePassword123!";

        // When
        Password password1 = Password.create(plainPassword, passwordEncoder);
        Password password2 = Password.create(plainPassword, passwordEncoder);

        // Then
        assertThat(password1.getHash()).isNotEqualTo(password2.getHash());
        // But both should match the original password
        assertThat(password1.matches(plainPassword, passwordEncoder)).isTrue();
        assertThat(password2.matches(plainPassword, passwordEncoder)).isTrue();
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when hashes are the same")
    void shouldBeEqualWhenHashesAreTheSame() {
        // Given
        String hash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        Password password1 = Password.fromHash(hash);
        Password password2 = Password.fromHash(hash);

        // Then
        assertThat(password1).isEqualTo(password2);
        assertThat(password1.hashCode()).isEqualTo(password2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when hashes differ")
    void shouldNotBeEqualWhenHashesDiffer() {
        // Given
        Password password1 = Password.create("Password1", passwordEncoder);
        Password password2 = Password.create("Password2", passwordEncoder);

        // Then
        assertThat(password1).isNotEqualTo(password2);
    }
}