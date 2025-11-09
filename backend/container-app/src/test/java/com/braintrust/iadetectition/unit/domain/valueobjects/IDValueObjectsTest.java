package com.braintrust.iadetectition.unit.domain.valueobjects;

import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.RepeatedTest;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for ID value objects (AnalysisId and SubmissionId).
 * Tests uniqueness, validation, and equality.
 */
@DisplayName("ID Value Objects Tests")
class IDValueObjectsTest {

    // ========================================
    // ✅ ANALYSIS ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique AnalysisId")
    void shouldGenerateUniqueAnalysisId() {
        // When
        AnalysisId id1 = AnalysisId.generate();
        AnalysisId id2 = AnalysisId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).isNotNull();
        assertThat(id1.getValue()).startsWith("ANALYSIS-");
        assertThat(id1).isNotEqualTo(id2);
        assertThat(id1.getValue()).isNotEqualTo(id2.getValue());
    }

    @RepeatedTest(100)
    @DisplayName("Should generate unique AnalysisId consistently (100 iterations)")
    void shouldGenerateUniqueAnalysisIdConsistently() {
        // Given
        Set<String> generatedIds = new HashSet<>();

        // When
        for (int i = 0; i < 1000; i++) {
            AnalysisId id = AnalysisId.generate();
            boolean wasUnique = generatedIds.add(id.getValue());

            // Then
            assertThat(wasUnique)
                    .as("Generated ID %s should be unique", id.getValue())
                    .isTrue();
        }
    }

    @Test
    @DisplayName("Should create AnalysisId from valid string")
    void shouldCreateAnalysisIdFromValidString() {
        // Given
        String value = "ANALYSIS-12345-abcde";

        // When
        AnalysisId id = AnalysisId.fromString(value);

        // Then
        assertThat(id).isNotNull();
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("Should throw exception when creating AnalysisId from null")
    void shouldThrowExceptionWhenCreatingAnalysisIdFromNull() {
        // When/Then
        assertThatThrownBy(() -> AnalysisId.fromString(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Analysis ID cannot be null");
    }

    @Test
    @DisplayName("Should accept AnalysisId without prefix")
    void shouldAcceptAnalysisIdWithoutPrefix() {
        // Given
        String customValue = "CUSTOM-ID-FORMAT";

        // When
        AnalysisId id = AnalysisId.fromString(customValue);

        // Then
        assertThat(id.getValue()).isEqualTo(customValue);
    }

    @Test
    @DisplayName("AnalysisIds should be equal when values are the same")
    void analysisIdsShouldBeEqualWhenValuesAreTheSame() {
        // Given
        String value = "ANALYSIS-12345";
        AnalysisId id1 = AnalysisId.fromString(value);
        AnalysisId id2 = AnalysisId.fromString(value);

        // Then
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    @Test
    @DisplayName("AnalysisIds should not be equal when values differ")
    void analysisIdsShouldNotBeEqualWhenValuesDiffer() {
        // Given
        AnalysisId id1 = AnalysisId.fromString("ANALYSIS-11111");
        AnalysisId id2 = AnalysisId.fromString("ANALYSIS-22222");

        // Then
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("AnalysisId should not be equal to null")
    void analysisIdShouldNotBeEqualToNull() {
        // Given
        AnalysisId id = AnalysisId.generate();

        // Then
        assertThat(id).isNotEqualTo(null);
    }


    @Test
    @DisplayName("Generated AnalysisId should contain UUID")
    void generatedAnalysisIdShouldContainUUID() {
        // When
        AnalysisId id = AnalysisId.generate();

        // Then
        String value = id.getValue();
        assertThat(value).startsWith("ANALYSIS-");

        // Extract UUID part (after "ANALYSIS-")
        String uuidPart = value.substring("ANALYSIS-".length());

        // UUID format: 8-4-4-4-12 characters
        assertThat(uuidPart).matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}");
    }

    @Test
    @DisplayName("AnalysisId should be usable as map key")
    void analysisIdShouldBeUsableAsMapKey() {
        // Given
        AnalysisId id1 = AnalysisId.generate();
        AnalysisId id2 = AnalysisId.fromString(id1.getValue());

        Set<AnalysisId> idSet = new HashSet<>();
        idSet.add(id1);

        // Then
        assertThat(idSet).contains(id2);
        assertThat(idSet).hasSize(1);
    }

    // ========================================
    // ✅ SUBMISSION ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique SubmissionId")
    void shouldGenerateUniqueSubmissionId() {
        // When
        SubmissionId id1 = SubmissionId.generate();
        SubmissionId id2 = SubmissionId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).isNotNull();
        assertThat(id1.getValue()).startsWith("SUBM-");
        assertThat(id1).isNotEqualTo(id2);
        assertThat(id1.getValue()).isNotEqualTo(id2.getValue());
    }

    @RepeatedTest(100)
    @DisplayName("Should generate unique SubmissionId consistently (100 iterations)")
    void shouldGenerateUniqueSubmissionIdConsistently() {
        // Given
        Set<String> generatedIds = new HashSet<>();

        // When
        for (int i = 0; i < 1000; i++) {
            SubmissionId id = SubmissionId.generate();
            boolean wasUnique = generatedIds.add(id.getValue());

            // Then
            assertThat(wasUnique)
                    .as("Generated ID %s should be unique", id.getValue())
                    .isTrue();
        }
    }

    @Test
    @DisplayName("Should create SubmissionId from valid string")
    void shouldCreateSubmissionIdFromValidString() {
        // Given
        String value = "SUBM-12345-abcde";

        // When
        SubmissionId id = SubmissionId.fromString(value);

        // Then
        assertThat(id).isNotNull();
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("Should throw exception when creating SubmissionId from null")
    void shouldThrowExceptionWhenCreatingSubmissionIdFromNull() {
        // When/Then
        assertThatThrownBy(() -> SubmissionId.fromString(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("Submission ID cannot be null");
    }

    @Test
    @DisplayName("Should accept SubmissionId without prefix")
    void shouldAcceptSubmissionIdWithoutPrefix() {
        // Given
        String customValue = "CUSTOM-SUBMISSION-ID";

        // When
        SubmissionId id = SubmissionId.fromString(customValue);

        // Then
        assertThat(id.getValue()).isEqualTo(customValue);
    }

    @Test
    @DisplayName("SubmissionIds should be equal when values are the same")
    void submissionIdsShouldBeEqualWhenValuesAreTheSame() {
        // Given
        String value = "SUBM-12345";
        SubmissionId id1 = SubmissionId.fromString(value);
        SubmissionId id2 = SubmissionId.fromString(value);

        // Then
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    @Test
    @DisplayName("SubmissionIds should not be equal when values differ")
    void submissionIdsShouldNotBeEqualWhenValuesDiffer() {
        // Given
        SubmissionId id1 = SubmissionId.fromString("SUBM-11111");
        SubmissionId id2 = SubmissionId.fromString("SUBM-22222");

        // Then
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("SubmissionId should not be equal to null")
    void submissionIdShouldNotBeEqualToNull() {
        // Given
        SubmissionId id = SubmissionId.generate();

        // Then
        assertThat(id).isNotEqualTo(null);
    }



    @Test
    @DisplayName("Generated SubmissionId should contain UUID")
    void generatedSubmissionIdShouldContainUUID() {
        // When
        SubmissionId id = SubmissionId.generate();

        // Then
        String value = id.getValue();
        assertThat(value).startsWith("SUBM-");

        // Extract UUID part (after "SUBM-")
        String uuidPart = value.substring("SUBM-".length());

        // UUID format: 8-4-4-4-12 characters
        assertThat(uuidPart).matches("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}");
    }

    @Test
    @DisplayName("SubmissionId should be usable as map key")
    void submissionIdShouldBeUsableAsMapKey() {
        // Given
        SubmissionId id1 = SubmissionId.generate();
        SubmissionId id2 = SubmissionId.fromString(id1.getValue());

        Set<SubmissionId> idSet = new HashSet<>();
        idSet.add(id1);

        // Then
        assertThat(idSet).contains(id2);
        assertThat(idSet).hasSize(1);
    }

    // ========================================
    // ✅ CROSS-TYPE COMPARISON TESTS
    // ========================================

    @Test
    @DisplayName("AnalysisId and SubmissionId should not be equal even with same UUID")
    void analysisIdAndSubmissionIdShouldNotBeEqual() {
        // Given
        String uuid = java.util.UUID.randomUUID().toString();
        AnalysisId analysisId = AnalysisId.fromString("ANALYSIS-" + uuid);
        SubmissionId submissionId = SubmissionId.fromString("SUBM-" + uuid);

        // Then
        assertThat(analysisId).isNotEqualTo(submissionId);
    }

    @Test
    @DisplayName("Different ID types should have different prefixes")
    void differentIdTypesShouldHaveDifferentPrefixes() {
        // When
        AnalysisId analysisId = AnalysisId.generate();
        SubmissionId submissionId = SubmissionId.generate();

        // Then
        assertThat(analysisId.getValue()).startsWith("ANALYSIS-");
        assertThat(submissionId.getValue()).startsWith("SUBM-");
        assertThat(analysisId.getValue()).doesNotStartWith("SUBM-");
        assertThat(submissionId.getValue()).doesNotStartWith("ANALYSIS-");
    }

    // ========================================
    // ✅ EDGE CASE TESTS
    // ========================================

    @Test
    @DisplayName("Should handle very long custom ID values")
    void shouldHandleVeryLongCustomIdValues() {
        // Given
        String longValue = "ANALYSIS-" + "X".repeat(1000);

        // When
        AnalysisId id = AnalysisId.fromString(longValue);

        // Then
        assertThat(id.getValue()).hasSize(1009); // "ANALYSIS-" + 1000 X's
    }

    @Test
    @DisplayName("Should handle special characters in custom ID")
    void shouldHandleSpecialCharactersInCustomId() {
        // Given
        String specialValue = "ANALYSIS-123-ABC_xyz.test@domain";

        // When
        AnalysisId id = AnalysisId.fromString(specialValue);

        // Then
        assertThat(id.getValue()).isEqualTo(specialValue);
    }

    @Test
    @DisplayName("Should preserve exact string value when creating from string")
    void shouldPreserveExactStringValueWhenCreatingFromString() {
        // Given
        String exactValue = "MyCustomID-With-Specific-Format-12345";

        // When
        AnalysisId id = AnalysisId.fromString(exactValue);

        // Then
        assertThat(id.getValue()).isEqualTo(exactValue);
    }

    @Test
    @DisplayName("Generated IDs should be thread-safe")
    void generatedIdsShouldBeThreadSafe() throws InterruptedException {
        // Given
        Set<String> generatedIds = java.util.Collections.synchronizedSet(new HashSet<>());
        int threadCount = 10;
        int idsPerThread = 100;

        Thread[] threads = new Thread[threadCount];

        // When
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < idsPerThread; j++) {
                    AnalysisId id = AnalysisId.generate();
                    generatedIds.add(id.getValue());
                }
            });
            threads[i].start();
        }

        // Wait for all threads to complete
        for (Thread thread : threads) {
            thread.join();
        }

        // Then
        assertThat(generatedIds).hasSize(threadCount * idsPerThread);
    }
}