package com.braintrust.identity.unit.domain.valueobjects;


import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("ID Value Objects Tests")
class IdValueObjectsTest {

    // ========================================
    // ✅ PERSON ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique PersonId")
    void shouldGenerateUniquePersonId() {
        // When
        PersonId id1 = PersonId.generate();
        PersonId id2 = PersonId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).isNotNull();
        assertThat(id1.getValue()).startsWith("PERSON-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create PersonId from string")
    void shouldCreatePersonIdFromString() {
        // Given
        String value = "PERSON-12345";

        // When
        PersonId id = PersonId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("Should throw exception when creating PersonId from null")
    void shouldThrowExceptionWhenCreatingPersonIdFromNull() {
        // When/Then
        assertThatThrownBy(() -> PersonId.fromString(null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("PersonIds should be equal when values are the same")
    void personIdsShouldBeEqualWhenValuesAreTheSame() {
        // Given
        String value = "PERSON-12345";
        PersonId id1 = PersonId.fromString(value);
        PersonId id2 = PersonId.fromString(value);

        // Then
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    // ========================================
    // ✅ USER ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique UserId")
    void shouldGenerateUniqueUserId() {
        // When
        UserId id1 = UserId.generate();
        UserId id2 = UserId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).startsWith("USER-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create UserId from string")
    void shouldCreateUserIdFromString() {
        // Given
        String value = "USER-12345";

        // When
        UserId id = UserId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("Should throw exception when creating UserId from null")
    void shouldThrowExceptionWhenCreatingUserIdFromNull() {
        // When/Then
        assertThatThrownBy(() -> UserId.fromString(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User ID cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when creating UserId from empty string")
    void shouldThrowExceptionWhenCreatingUserIdFromEmptyString() {
        // When/Then
        assertThatThrownBy(() -> UserId.fromString("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User ID cannot be null or empty");
    }

    @Test
    @DisplayName("UserId should have valid toString")
    void userIdShouldHaveValidToString() {
        // Given
        String value = "USER-12345";
        UserId id = UserId.fromString(value);

        // Then
        assertThat(id.toString()).isEqualTo(value);
    }

    @Test
    @DisplayName("UserIds should be equal when values are the same")
    void userIdsShouldBeEqualWhenValuesAreTheSame() {
        // Given
        String value = "USER-12345";
        UserId id1 = UserId.fromString(value);
        UserId id2 = UserId.fromString(value);

        // Then
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    @Test
    @DisplayName("UserIds should not be equal when values differ")
    void userIdsShouldNotBeEqualWhenValuesDiffer() {
        // Given
        UserId id1 = UserId.fromString("USER-123");
        UserId id2 = UserId.fromString("USER-456");

        // Then
        assertThat(id1).isNotEqualTo(id2);
    }
}