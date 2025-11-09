package com.braintrust.education.unit.domain.valueobjects;


import com.braintrust.education.domain.valueobjects.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("ID Value Objects Tests")
class IdValueObjectsTest {

    // ========================================
    // ✅ ASSIGNMENT ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique AssignmentId")
    void shouldGenerateUniqueAssignmentId() {
        // When
        AssignmentId id1 = AssignmentId.generate();
        AssignmentId id2 = AssignmentId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).isNotNull();
        assertThat(id1.getValue()).startsWith("ASSIGN-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create AssignmentId from string")
    void shouldCreateAssignmentIdFromString() {
        // Given
        String value = "ASSIGN-12345";

        // When
        AssignmentId id = AssignmentId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("Should throw exception when creating AssignmentId from null")
    void shouldThrowExceptionWhenCreatingAssignmentIdFromNull() {
        // When/Then
        assertThatThrownBy(() -> AssignmentId.fromString(null))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("AssignmentIds should be equal when values are the same")
    void assignmentIdsShouldBeEqualWhenValuesAreTheSame() {
        // Given
        String value = "ASSIGN-12345";
        AssignmentId id1 = AssignmentId.fromString(value);
        AssignmentId id2 = AssignmentId.fromString(value);

        // Then
        assertThat(id1).isEqualTo(id2);
        assertThat(id1.hashCode()).isEqualTo(id2.hashCode());
    }

    // ========================================
    // ✅ COURSE ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique CourseId")
    void shouldGenerateUniqueCourseId() {
        // When
        CourseId id1 = CourseId.generate();
        CourseId id2 = CourseId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).startsWith("COURSE-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create CourseId from string")
    void shouldCreateCourseIdFromString() {
        // Given
        String value = "COURSE-12345";

        // When
        CourseId id = CourseId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
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
        assertThat(id1.getValue()).startsWith("SUBM-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create SubmissionId from string")
    void shouldCreateSubmissionIdFromString() {
        // Given
        String value = "SUBM-12345";

        // When
        SubmissionId id = SubmissionId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    // ========================================
    // ✅ ENROLLMENT ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique EnrollmentId")
    void shouldGenerateUniqueEnrollmentId() {
        // When
        EnrollmentId id1 = EnrollmentId.generate();
        EnrollmentId id2 = EnrollmentId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).startsWith("ENROLL-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create EnrollmentId from string")
    void shouldCreateEnrollmentIdFromString() {
        // Given
        String value = "ENROLL-12345";

        // When
        EnrollmentId id = EnrollmentId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("EnrollmentId should have valid toString")
    void enrollmentIdShouldHaveValidToString() {
        // Given
        String value = "ENROLL-12345";
        EnrollmentId id = EnrollmentId.fromString(value);

        // Then
        assertThat(id.toString()).isEqualTo(value);
    }

    // ========================================
    // ✅ UNIT ID TESTS
    // ========================================

    @Test
    @DisplayName("Should generate unique UnitId")
    void shouldGenerateUniqueUnitId() {
        // When
        UnitId id1 = UnitId.generate();
        UnitId id2 = UnitId.generate();

        // Then
        assertThat(id1).isNotNull();
        assertThat(id1.getValue()).startsWith("UNIT-");
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    @DisplayName("Should create UnitId from string")
    void shouldCreateUnitIdFromString() {
        // Given
        String value = "UNIT-12345";

        // When
        UnitId id = UnitId.fromString(value);

        // Then
        assertThat(id.getValue()).isEqualTo(value);
    }

    @Test
    @DisplayName("UnitId should have valid toString")
    void unitIdShouldHaveValidToString() {
        // Given
        String value = "UNIT-12345";
        UnitId id = UnitId.fromString(value);

        // Then
        assertThat(id.toString()).isEqualTo(value);
    }
}