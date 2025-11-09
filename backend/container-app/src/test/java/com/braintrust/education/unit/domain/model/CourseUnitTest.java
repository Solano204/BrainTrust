package com.braintrust.education.unit.domain.model;


import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("CourseUnit Domain Model Tests")
class CourseUnitTest {

    private static final CourseId VALID_COURSE_ID = CourseId.generate();
    private static final String VALID_NAME = "Unit 1: Introduction";
    private static final int VALID_NUM_UNITY = 1;
    private static final String VALID_DESCRIPTION = "Introduction to the course";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create unit with valid data")
    void shouldCreateUnitWithValidData() {
        // When
        CourseUnit unit = CourseUnit.create(
                VALID_COURSE_ID,
                VALID_NAME,
                VALID_NUM_UNITY,
                VALID_DESCRIPTION
        );

        // Then
        assertThat(unit).isNotNull();
        assertThat(unit.getId()).isNotNull();
        assertThat(unit.getCourseId()).isEqualTo(VALID_COURSE_ID);
        assertThat(unit.getName()).isEqualTo(VALID_NAME);
        assertThat(unit.getNumUnity()).isEqualTo(VALID_NUM_UNITY);
        assertThat(unit.getDescription()).isEqualTo(VALID_DESCRIPTION);
        assertThat(unit.getUrlImage()).isNull();
    }

    @Test
    @DisplayName("Should create unit with image")
    void shouldCreateUnitWithImage() {
        // Given
        String imageUrl = "https://example.com/unit-image.jpg";

        // When
        CourseUnit unit = CourseUnit.createWithImage(
                VALID_COURSE_ID,
                VALID_NAME,
                VALID_NUM_UNITY,
                VALID_DESCRIPTION,
                imageUrl
        );

        // Then
        assertThat(unit.getUrlImage()).isEqualTo(imageUrl);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when name is null or blank")
    void shouldThrowExceptionWhenNameIsNullOrBlank(String invalidName) {
        // When/Then
        assertThatThrownBy(() ->
                CourseUnit.create(
                        VALID_COURSE_ID,
                        invalidName,
                        VALID_NUM_UNITY,
                        VALID_DESCRIPTION
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when numUnity is negative")
    void shouldThrowExceptionWhenNumUnityIsNegative() {
        // When/Then
        assertThatThrownBy(() ->
                CourseUnit.create(
                        VALID_COURSE_ID,
                        VALID_NAME,
                        -1,
                        VALID_DESCRIPTION
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("numUnity cannot be negative");
    }

    // ========================================
    // ✅ IMAGE URL TESTS
    // ========================================

    @Test
    @DisplayName("Should set image URL")
    void shouldSetImageUrl() {
        // Given
        CourseUnit unit = createValidUnit();
        String imageUrl = "https://example.com/new-image.jpg";

        // When
        unit.setUrlImage(imageUrl);

        // Then
        assertThat(unit.getUrlImage()).isEqualTo(imageUrl);
    }

    @Test
    @DisplayName("Should set null image URL")
    void shouldSetNullImageUrl() {
        // Given
        CourseUnit unit = CourseUnit.createWithImage(
                VALID_COURSE_ID,
                VALID_NAME,
                VALID_NUM_UNITY,
                VALID_DESCRIPTION,
                "https://example.com/old-image.jpg"
        );

        // When
        unit.setUrlImage(null);

        // Then
        assertThat(unit.getUrlImage()).isNull();
    }

    @Test
    @DisplayName("Should throw exception when setting empty image URL")
    void shouldThrowExceptionWhenSettingEmptyImageUrl() {
        // Given
        CourseUnit unit = createValidUnit();

        // When/Then
        assertThatThrownBy(() -> unit.setUrlImage("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("URL image cannot be empty string");
    }

    // ========================================
    // ✅ UPDATE TESTS
    // ========================================

    @Test
    @DisplayName("Should update unit details")
    void shouldUpdateUnitDetails() {
        // Given
        CourseUnit unit = createValidUnit();
        String newName = "Unit 1: Updated Introduction";
        String newDescription = "Updated description";

        // When
        unit.updateDetails(newName, newDescription);

        // Then
        assertThat(unit.getName()).isEqualTo(newName);
        assertThat(unit.getDescription()).isEqualTo(newDescription);
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute unit from persistence")
    void shouldReconstituteUnitFromPersistence() {
        // Given
        UnitId id = UnitId.generate();
        String imageUrl = "https://example.com/persisted-image.jpg";

        // When
        CourseUnit unit = CourseUnit.reconstitute(
                id,
                VALID_COURSE_ID,
                VALID_NAME,
                VALID_NUM_UNITY,
                VALID_DESCRIPTION,
                imageUrl
        );

        // Then
        assertThat(unit.getId()).isEqualTo(id);
        assertThat(unit.getUrlImage()).isEqualTo(imageUrl);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private CourseUnit createValidUnit() {
        return CourseUnit.create(
                VALID_COURSE_ID,
                VALID_NAME,
                VALID_NUM_UNITY,
                VALID_DESCRIPTION
        );
    }
}