package com.braintrust.iadetectition.unit.domain.valueobjects;

import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for ModelType enum.
 * Tests enum properties and behavior.
 */
@DisplayName("ModelType Enum Tests")
class ModelTypeTest {

    // ========================================
    // ✅ ENUM VALUES TESTS
    // ========================================

    @Test
    @DisplayName("Should have exactly three model types")
    void shouldHaveExactlyThreeModelTypes() {
        // Then
        assertThat(ModelType.values()).hasSize(3);
    }

    @Test
    @DisplayName("Should contain GPT_DETECTOR")
    void shouldContainGptDetector() {
        // When
        ModelType model = ModelType.GPT_DETECTOR;

        // Then
        assertThat(model).isNotNull();
        assertThat(model.name()).isEqualTo("GPT_DETECTOR");
    }

    @Test
    @DisplayName("Should contain BERT_CLASSIFIER")
    void shouldContainBertClassifier() {
        // When
        ModelType model = ModelType.BERT_CLASSIFIER;

        // Then
        assertThat(model).isNotNull();
        assertThat(model.name()).isEqualTo("BERT_CLASSIFIER");
    }

    @Test
    @DisplayName("Should contain ENSEMBLE")
    void shouldContainEnsemble() {
        // When
        ModelType model = ModelType.ENSEMBLE;

        // Then
        assertThat(model).isNotNull();
        assertThat(model.name()).isEqualTo("ENSEMBLE");
    }

    // ========================================
    // ✅ DISPLAY NAME TESTS
    // ========================================

    @Test
    @DisplayName("GPT_DETECTOR should have correct display name")
    void gptDetectorShouldHaveCorrectDisplayName() {
        // When
        String displayName = ModelType.GPT_DETECTOR.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("GPT Detector");
    }

    @Test
    @DisplayName("BERT_CLASSIFIER should have correct display name")
    void bertClassifierShouldHaveCorrectDisplayName() {
        // When
        String displayName = ModelType.BERT_CLASSIFIER.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("BERT Classifier");
    }

    @Test
    @DisplayName("ENSEMBLE should have correct display name")
    void ensembleShouldHaveCorrectDisplayName() {
        // When
        String displayName = ModelType.ENSEMBLE.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("Ensemble Model");
    }

    @Test
    @DisplayName("All display names should be non-null and non-empty")
    void allDisplayNamesShouldBeNonNullAndNonEmpty() {
        for (ModelType modelType : ModelType.values()) {
            assertThat(modelType.getDisplayName())
                    .as("Display name for %s", modelType.name())
                    .isNotNull()
                    .isNotEmpty();
        }
    }

    @Test
    @DisplayName("All display names should be unique")
    void allDisplayNamesShouldBeUnique() {
        // Given
        java.util.Set<String> displayNames = new java.util.HashSet<>();

        // When
        for (ModelType modelType : ModelType.values()) {
            boolean wasUnique = displayNames.add(modelType.getDisplayName());

            // Then
            assertThat(wasUnique)
                    .as("Display name '%s' should be unique", modelType.getDisplayName())
                    .isTrue();
        }
    }

    // ========================================
    // ✅ VERSION TESTS
    // ========================================

    @Test
    @DisplayName("GPT_DETECTOR should have version 2.1")
    void gptDetectorShouldHaveVersion21() {
        // When
        String version = ModelType.GPT_DETECTOR.getVersion();

        // Then
        assertThat(version).isEqualTo("v2.1");
    }

    @Test
    @DisplayName("BERT_CLASSIFIER should have version 1.5")
    void bertClassifierShouldHaveVersion15() {
        // When
        String version = ModelType.BERT_CLASSIFIER.getVersion();

        // Then
        assertThat(version).isEqualTo("v1.5");
    }

    @Test
    @DisplayName("ENSEMBLE should have version 3.0")
    void ensembleShouldHaveVersion30() {
        // When
        String version = ModelType.ENSEMBLE.getVersion();

        // Then
        assertThat(version).isEqualTo("v3.0");
    }

    @Test
    @DisplayName("All versions should be non-null and non-empty")
    void allVersionsShouldBeNonNullAndNonEmpty() {
        for (ModelType modelType : ModelType.values()) {
            assertThat(modelType.getVersion())
                    .as("Version for %s", modelType.name())
                    .isNotNull()
                    .isNotEmpty();
        }
    }

    @Test
    @DisplayName("All versions should follow semantic versioning pattern")
    void allVersionsShouldFollowSemanticVersioningPattern() {
        for (ModelType modelType : ModelType.values()) {
            String version = modelType.getVersion();

            assertThat(version)
                    .as("Version for %s should start with 'v'", modelType.name())
                    .startsWith("v");

            // Remove 'v' prefix and check format
            String versionNumber = version.substring(1);
            assertThat(versionNumber)
                    .as("Version number for %s should match X.Y pattern", modelType.name())
                    .matches("\\d+\\.\\d+");
        }
    }

    @Test
    @DisplayName("All versions should be unique")
    void allVersionsShouldBeUnique() {
        // Given
        java.util.Set<String> versions = new java.util.HashSet<>();

        // When
        for (ModelType modelType : ModelType.values()) {
            boolean wasUnique = versions.add(modelType.getVersion());

            // Then
            assertThat(wasUnique)
                    .as("Version '%s' should be unique", modelType.getVersion())
                    .isTrue();
        }
    }

    // ========================================
    // ✅ ENUM BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should convert from string to enum correctly")
    void shouldConvertFromStringToEnumCorrectly() {
        // When
        ModelType gpt = ModelType.valueOf("GPT_DETECTOR");
        ModelType bert = ModelType.valueOf("BERT_CLASSIFIER");
        ModelType ensemble = ModelType.valueOf("ENSEMBLE");

        // Then
        assertThat(gpt).isEqualTo(ModelType.GPT_DETECTOR);
        assertThat(bert).isEqualTo(ModelType.BERT_CLASSIFIER);
        assertThat(ensemble).isEqualTo(ModelType.ENSEMBLE);
    }

    @Test
    @DisplayName("Should throw exception for invalid enum string")
    void shouldThrowExceptionForInvalidEnumString() {
        // When/Then
        assertThatThrownBy(() -> ModelType.valueOf("INVALID_MODEL"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Should throw exception for null enum string")
    void shouldThrowExceptionForNullEnumString() {
        // When/Then
        assertThatThrownBy(() -> ModelType.valueOf(null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Should be comparable")
    void shouldBeComparable() {
        // When
        ModelType first = ModelType.GPT_DETECTOR;
        ModelType second = ModelType.BERT_CLASSIFIER;
        ModelType third = ModelType.ENSEMBLE;

        // Then
        assertThat(first.ordinal()).isLessThan(second.ordinal());
        assertThat(second.ordinal()).isLessThan(third.ordinal());
    }

    @Test
    @DisplayName("Should maintain consistent ordinal values")
    void shouldMaintainConsistentOrdinalValues() {
        // Then
        assertThat(ModelType.GPT_DETECTOR.ordinal()).isEqualTo(0);
        assertThat(ModelType.BERT_CLASSIFIER.ordinal()).isEqualTo(1);
        assertThat(ModelType.ENSEMBLE.ordinal()).isEqualTo(2);
    }

    // ========================================
    // ✅ EQUALITY AND IDENTITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal to itself")
    void shouldBeEqualToItself() {
        for (ModelType modelType : ModelType.values()) {
            assertThat(modelType).isEqualTo(modelType);
        }
    }

    @Test
    @DisplayName("Should not be equal to different enum constant")
    void shouldNotBeEqualToDifferentEnumConstant() {
        // Then
        assertThat(ModelType.GPT_DETECTOR).isNotEqualTo(ModelType.BERT_CLASSIFIER);
        assertThat(ModelType.BERT_CLASSIFIER).isNotEqualTo(ModelType.ENSEMBLE);
        assertThat(ModelType.ENSEMBLE).isNotEqualTo(ModelType.GPT_DETECTOR);
    }

    @Test
    @DisplayName("Should use same instance for same enum constant")
    void shouldUseSameInstanceForSameEnumConstant() {
        // Given
        ModelType model1 = ModelType.ENSEMBLE;
        ModelType model2 = ModelType.valueOf("ENSEMBLE");

        // Then
        assertThat(model1).isSameAs(model2);
    }

    @Test
    @DisplayName("Should have consistent hashCode")
    void shouldHaveConsistentHashCode() {
        for (ModelType modelType : ModelType.values()) {
            int hashCode1 = modelType.hashCode();
            int hashCode2 = modelType.hashCode();

            assertThat(hashCode1).isEqualTo(hashCode2);
        }
    }

    // ========================================
    // ✅ SWITCH STATEMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should work correctly in switch statements")
    void shouldWorkCorrectlyInSwitchStatements() {
        for (ModelType modelType : ModelType.values()) {
            String result = switch (modelType) {
                case GPT_DETECTOR -> "GPT";
                case BERT_CLASSIFIER -> "BERT";
                case ENSEMBLE -> "ENSEMBLE";
            };

            assertThat(result).isNotNull();
        }
    }

    // ========================================
    // ✅ SERIALIZATION COMPATIBILITY TESTS
    // ========================================

    @Test
    @DisplayName("Should have stable name() for serialization")
    void shouldHaveStableNameForSerialization() {
        // These names should never change as they may be persisted
        assertThat(ModelType.GPT_DETECTOR.name()).isEqualTo("GPT_DETECTOR");
        assertThat(ModelType.BERT_CLASSIFIER.name()).isEqualTo("BERT_CLASSIFIER");
        assertThat(ModelType.ENSEMBLE.name()).isEqualTo("ENSEMBLE");
    }

    @Test
    @DisplayName("Should have toString that matches name")
    void shouldHaveToStringThatMatchesName() {
        for (ModelType modelType : ModelType.values()) {
            assertThat(modelType.toString()).isEqualTo(modelType.name());
        }
    }

    // ========================================
    // ✅ COMPLETENESS TESTS
    // ========================================

    @Test
    @DisplayName("Should cover all expected model types")
    void shouldCoverAllExpectedModelTypes() {
        // Given
        java.util.Set<String> expectedModels = new java.util.HashSet<>();
        expectedModels.add("GPT_DETECTOR");
        expectedModels.add("BERT_CLASSIFIER");
        expectedModels.add("ENSEMBLE");

        // When
        java.util.Set<String> actualModels = new java.util.HashSet<>();
        for (ModelType modelType : ModelType.values()) {
            actualModels.add(modelType.name());
        }

        // Then
        assertThat(actualModels).isEqualTo(expectedModels);
    }

    @Test
    @DisplayName("Each model should have unique properties combination")
    void eachModelShouldHaveUniquePropertiesCombination() {
        java.util.Set<String> combinations = new java.util.HashSet<>();

        for (ModelType modelType : ModelType.values()) {
            String combination = modelType.getDisplayName() + "|" + modelType.getVersion();
            boolean wasUnique = combinations.add(combination);

            assertThat(wasUnique)
                    .as("Model %s should have unique display name and version combination", modelType.name())
                    .isTrue();
        }
    }

    // ========================================
    // ✅ DOCUMENTATION TESTS
    // ========================================

    @Test
    @DisplayName("Display names should be user-friendly")
    void displayNamesShouldBeUserFriendly() {
        for (ModelType modelType : ModelType.values()) {
            String displayName = modelType.getDisplayName();

            // Should contain spaces or be readable
            assertThat(displayName)
                    .as("Display name for %s should be user-friendly", modelType.name())
                    .matches(".*[A-Z][a-z].*"); // Contains capitalized words
        }
    }

    @Test
    @DisplayName("All models should be documented with display name and version")
    void allModelsShouldBeDocumentedWithDisplayNameAndVersion() {
        for (ModelType modelType : ModelType.values()) {
            // Verify both display name and version are set
            assertThat(modelType.getDisplayName())
                    .as("Model %s should have display name", modelType.name())
                    .isNotNull()
                    .isNotBlank();

            assertThat(modelType.getVersion())
                    .as("Model %s should have version", modelType.name())
                    .isNotNull()
                    .isNotBlank();
        }
    }
}