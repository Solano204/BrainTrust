package com.braintrust.education.unit.domain.valueobjects;


import com.braintrust.education.domain.valueobjects.Document;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Document Value Object Tests")
class DocumentTest {

    private static final String VALID_NAME = "syllabus.pdf";
    private static final String VALID_STORAGE_PATH = "/files/syllabus.pdf";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create document with valid values")
    void shouldCreateDocumentWithValidValues() {
        // When
        Document document = new Document(VALID_NAME, VALID_STORAGE_PATH);

        // Then
        assertThat(document.getName()).isEqualTo(VALID_NAME);
        assertThat(document.getStoragePath()).isEqualTo(VALID_STORAGE_PATH);
        assertThat(document.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should trim whitespace from name")
    void shouldTrimWhitespaceFromName() {
        // Given
        String nameWithSpaces = "  document.pdf  ";

        // When
        Document document = new Document(nameWithSpaces, VALID_STORAGE_PATH);

        // Then
        assertThat(document.getName()).isEqualTo("document.pdf");
    }


    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when name is null or blank")
    void shouldThrowExceptionWhenNameIsNullOrBlank(String invalidName) {
        // When/Then
        assertThatThrownBy(() -> new Document(invalidName, VALID_STORAGE_PATH))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name cannot be null or empty");
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when name and storage path are the same")
    void shouldBeEqualWhenNameAndStoragePathAreTheSame() {
        // Given
        Document doc1 = new Document(VALID_NAME, VALID_STORAGE_PATH);
        Document doc2 = new Document(VALID_NAME, VALID_STORAGE_PATH);

        // Then
        assertThat(doc1).isEqualTo(doc2);
        assertThat(doc1.hashCode()).isEqualTo(doc2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when names differ")
    void shouldNotBeEqualWhenNamesDiffer() {
        // Given
        Document doc1 = new Document("file1.pdf", VALID_STORAGE_PATH);
        Document doc2 = new Document("file2.pdf", VALID_STORAGE_PATH);

        // Then
        assertThat(doc1).isNotEqualTo(doc2);
    }

    @Test
    @DisplayName("Should not be equal when storage paths differ")
    void shouldNotBeEqualWhenStoragePathsDiffer() {
        // Given
        Document doc1 = new Document(VALID_NAME, "/files/path1.pdf");
        Document doc2 = new Document(VALID_NAME, "/files/path2.pdf");

        // Then
        assertThat(doc1).isNotEqualTo(doc2);
    }

    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        // Given
        Document document = new Document(VALID_NAME, VALID_STORAGE_PATH);

        // Then
        assertThat(document).isNotEqualTo(null);
    }
}