package com.braintrust.education.unit.domain.model;


import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Enrollment Domain Model Tests")
class EnrollmentTest {

    private static final CourseId VALID_COURSE_ID = CourseId.generate();
    private static final UserId VALID_STUDENT_ID = UserId.generate();

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create enrollment with valid data")
    void shouldCreateEnrollmentWithValidData() {
        // When
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);

        // Then
        assertThat(enrollment).isNotNull();
        assertThat(enrollment.getId()).isNotNull();
        assertThat(enrollment.getCourseId()).isEqualTo(VALID_COURSE_ID);
        assertThat(enrollment.getStudentId()).isEqualTo(VALID_STUDENT_ID);
        assertThat(enrollment.getEnrollmentDate()).isEqualTo(LocalDate.now());
        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
        assertThat(enrollment.getFinalGrade()).isNull();
        assertThat(enrollment.isActive()).isTrue();
    }

    // ========================================
    // ✅ COMPLETION TESTS
    // ========================================

    @Test
    @DisplayName("Should complete enrollment with final grade")
    void shouldCompleteEnrollmentWithFinalGrade() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);
        Grade finalGrade = new Grade(new BigDecimal("92.50"), new BigDecimal("100.00"));

        // When
        enrollment.complete(finalGrade);

        // Then
        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(enrollment.getFinalGrade()).isEqualTo(finalGrade);
        assertThat(enrollment.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when completing non-active enrollment")
    void shouldThrowExceptionWhenCompletingNonActiveEnrollment() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);
        enrollment.cancel();
        Grade grade = new Grade(new BigDecimal("85"), new BigDecimal("100"));

        // When/Then
        assertThatThrownBy(() -> enrollment.complete(grade))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only active enrollments can be completed");
    }

    // ========================================
    // ✅ CANCELLATION TESTS
    // ========================================

    @Test
    @DisplayName("Should cancel active enrollment")
    void shouldCancelActiveEnrollment() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);

        // When
        enrollment.cancel();

        // Then
        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.CANCELLED);
        assertThat(enrollment.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when cancelling completed enrollment")
    void shouldThrowExceptionWhenCancellingCompletedEnrollment() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);
        Grade grade = new Grade(new BigDecimal("90"), new BigDecimal("100"));
        enrollment.complete(grade);

        // When/Then
        assertThatThrownBy(() -> enrollment.cancel())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot cancel completed enrollment");
    }

    // ========================================
    // ✅ STATUS VERIFICATION TESTS
    // ========================================

    @Test
    @DisplayName("Should verify enrollment is active")
    void shouldVerifyEnrollmentIsActive() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);

        // Then
        assertThat(enrollment.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should verify enrollment is not active after cancellation")
    void shouldVerifyEnrollmentIsNotActiveAfterCancellation() {
        // Given
        Enrollment enrollment = Enrollment.create(VALID_COURSE_ID, VALID_STUDENT_ID);
        enrollment.cancel();

        // Then
        assertThat(enrollment.isActive()).isFalse();
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute enrollment from persistence")
    void shouldReconstituteEnrollmentFromPersistence() {
        // Given
        EnrollmentId id = EnrollmentId.generate();
        LocalDate enrollmentDate = LocalDate.now().minusDays(30);
        Grade finalGrade = new Grade(new BigDecimal("88.75"), new BigDecimal("100.00"));

        // When
        Enrollment enrollment = Enrollment.reconstitute(
                id,
                VALID_COURSE_ID,
                VALID_STUDENT_ID,
                enrollmentDate,
                EnrollmentStatus.COMPLETED,
                finalGrade
        );

        // Then
        assertThat(enrollment.getId()).isEqualTo(id);
        assertThat(enrollment.getEnrollmentDate()).isEqualTo(enrollmentDate);
        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(enrollment.getFinalGrade()).isEqualTo(finalGrade);
    }

    @Test
    @DisplayName("Should reconstitute active enrollment without grade")
    void shouldReconstituteActiveEnrollmentWithoutGrade() {
        // Given
        EnrollmentId id = EnrollmentId.generate();
        LocalDate enrollmentDate = LocalDate.now().minusDays(10);

        // When
        Enrollment enrollment = Enrollment.reconstitute(
                id,
                VALID_COURSE_ID,
                VALID_STUDENT_ID,
                enrollmentDate,
                EnrollmentStatus.ACTIVE,
                null
        );

        // Then
        assertThat(enrollment.isActive()).isTrue();
        assertThat(enrollment.getFinalGrade()).isNull();
    }
}