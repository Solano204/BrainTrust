package com.braintrust.education.unit.domain.model;

import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Course Domain Model Tests")
class CourseTest {

    private static final String VALID_CODE = "CS-101";
    private static final String VALID_NAME = "Introduction to Computer Science";
    private static final String VALID_DESCRIPTION = "Basic CS concepts";
    private static final String VALID_GRADE = "10th";
    private static final String VALID_GROUP = "A";
    private static final UserId VALID_TEACHER_ID = UserId.generate();

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create course with valid data")
    void shouldCreateCourseWithValidData() {
        // Given
        CourseCode code = new CourseCode(VALID_CODE);

        // When
        Course course = Course.create(
                code,
                VALID_NAME,
                VALID_DESCRIPTION,
                VALID_GRADE,
                VALID_GROUP,
                VALID_TEACHER_ID
        );

        // Then
        assertThat(course).isNotNull();
        assertThat(course.getId()).isNotNull();
        assertThat(course.getCode()).isEqualTo(code);
        assertThat(course.getName()).isEqualTo(VALID_NAME);
        assertThat(course.getDescription()).isEqualTo(VALID_DESCRIPTION);
        assertThat(course.getGrade()).isEqualTo(VALID_GRADE);
        assertThat(course.getGroup()).isEqualTo(VALID_GROUP);
        assertThat(course.getTeacherId()).isEqualTo(VALID_TEACHER_ID);
        assertThat(course.isActive()).isTrue();
        assertThat(course.getEnrollments()).isEmpty();
        assertThat(course.getUnits()).isEmpty();
        assertThat(course.getUrlImage()).isNull();
    }

    @Test
    @DisplayName("Should create course with image URL")
    void shouldCreateCourseWithImage() {
        // Given
        CourseCode code = new CourseCode(VALID_CODE);
        String imageUrl = "https://example.com/image.jpg";

        // When
        Course course = Course.createWithImage(
                code,
                VALID_NAME,
                VALID_DESCRIPTION,
                VALID_GRADE,
                VALID_GROUP,
                VALID_TEACHER_ID,
                imageUrl
        );

        // Then
        assertThat(course.getUrlImage()).isEqualTo(imageUrl);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when name is null or blank")
    void shouldThrowExceptionWhenNameIsNullOrBlank(String invalidName) {
        // Given
        CourseCode code = new CourseCode(VALID_CODE);

        // When/Then
        assertThatThrownBy(() ->
                Course.create(
                        code,
                        invalidName,
                        VALID_DESCRIPTION,
                        VALID_GRADE,
                        VALID_GROUP,
                        VALID_TEACHER_ID
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when name exceeds 255 characters")
    void shouldThrowExceptionWhenNameExceedsMaxLength() {
        // Given
        CourseCode code = new CourseCode(VALID_CODE);
        String longName = "A".repeat(256);

        // When/Then
        assertThatThrownBy(() ->
                Course.create(
                        code,
                        longName,
                        VALID_DESCRIPTION,
                        VALID_GRADE,
                        VALID_GROUP,
                        VALID_TEACHER_ID
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 255 characters");
    }

    // ========================================
    // ✅ ENROLLMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should enroll student successfully")
    void shouldEnrollStudentSuccessfully() {
        // Given
        Course course = createValidCourse();
        UserId studentId = UserId.generate();

        // When
        Enrollment enrollment = course.enrollStudent(studentId);

        // Then
        assertThat(enrollment).isNotNull();
        assertThat(enrollment.getStudentId()).isEqualTo(studentId);
        assertThat(enrollment.getCourseId()).isEqualTo(course.getId());
        assertThat(enrollment.isActive()).isTrue();
        assertThat(course.getEnrollments()).hasSize(1);
    }

    @Test
    @DisplayName("Should throw exception when enrolling student to inactive course")
    void shouldThrowExceptionWhenEnrollingToInactiveCourse() {
        // Given
        Course course = createValidCourse();
        course.deactivate();
        UserId studentId = UserId.generate();

        // When/Then
        assertThatThrownBy(() -> course.enrollStudent(studentId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot enroll students in inactive course");
    }

    @Test
    @DisplayName("Should throw exception when enrolling already enrolled student")
    void shouldThrowExceptionWhenEnrollingAlreadyEnrolledStudent() {
        // Given
        Course course = createValidCourse();
        UserId studentId = UserId.generate();
        course.enrollStudent(studentId);

        // When/Then
        assertThatThrownBy(() -> course.enrollStudent(studentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student is already enrolled");
    }

    @Test
    @DisplayName("Should unenroll student successfully")
    void shouldUnenrollStudentSuccessfully() {
        // Given
        Course course = createValidCourse();
        UserId studentId = UserId.generate();
        course.enrollStudent(studentId);

        // When
        course.unenrollStudent(studentId);

        // Then
        assertThat(course.getEnrollments()).isEmpty();
    }

    @Test
    @DisplayName("Should throw exception when unenrolling non-enrolled student")
    void shouldThrowExceptionWhenUnenrollingNonEnrolledStudent() {
        // Given
        Course course = createValidCourse();
        UserId studentId = UserId.generate();

        // When/Then
        assertThatThrownBy(() -> course.unenrollStudent(studentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student is not enrolled");
    }

    // ========================================
    // ✅ ASSIGNMENT CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create assignment for active course")
    void shouldCreateAssignmentForActiveCourse() {
        // Given
        Course course = createValidCourse();
        String title = "Midterm Exam";
        String description = "Covers chapters 1-5";
        LocalDateTime dueDate = LocalDateTime.now().plusDays(7);
        int maxPoints = 100;
        String instructions = "Complete all questions";

        // When
        Assignment assignment = course.createAssignment(
                title,
                description,
                dueDate,
                maxPoints,
                instructions
        );

        // Then
        assertThat(assignment).isNotNull();
        assertThat(assignment.getCourseId()).isEqualTo(course.getId());
        assertThat(assignment.getTitle()).isEqualTo(title);
    }

    @Test
    @DisplayName("Should throw exception when creating assignment for inactive course")
    void shouldThrowExceptionWhenCreatingAssignmentForInactiveCourse() {
        // Given
        Course course = createValidCourse();
        course.deactivate();

        // When/Then
        assertThatThrownBy(() ->
                course.createAssignment(
                        "Test",
                        "Description",
                        LocalDateTime.now().plusDays(1),
                        100,
                        "Instructions"
                )
        ).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot create assignments for inactive course");
    }

    // ========================================
    // ✅ UNIT MANAGEMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should add unit to course")
    void shouldAddUnitToCourse() {
        // Given
        Course course = createValidCourse();
        String unitName = "Unit 1: Introduction";
        int order = 1;
        String description = "Introduction to the course";

        // When
        CourseUnit unit = course.addUnit(unitName, order, description);

        // Then
        assertThat(unit).isNotNull();
        assertThat(unit.getCourseId()).isEqualTo(course.getId());
        assertThat(unit.getName()).isEqualTo(unitName);
        assertThat(course.getUnits()).hasSize(1);
    }

    @Test
    @DisplayName("Should add unit with image")
    void shouldAddUnitWithImage() {
        // Given
        Course course = createValidCourse();
        String imageUrl = "https://example.com/unit-image.jpg";

        // When
        CourseUnit unit = course.addUnitWithImage(
                "Unit 1",
                1,
                "Description",
                imageUrl
        );

        // Then
        assertThat(unit.getUrlImage()).isEqualTo(imageUrl);
    }

    // ========================================
    // ✅ STATE MANAGEMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should activate course")
    void shouldActivateCourse() {
        // Given
        Course course = createValidCourse();
        course.deactivate();

        // When
        course.activate();

        // Then
        assertThat(course.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should deactivate course")
    void shouldDeactivateCourse() {
        // Given
        Course course = createValidCourse();

        // When
        course.deactivate();

        // Then
        assertThat(course.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should update course details")
    void shouldUpdateCourseDetails() {
        // Given
        Course course = createValidCourse();
        String newName = "Advanced Computer Science";
        String newDescription = "Advanced CS concepts";
        String newGrade = "11th";
        String newGroup = "B";

        // When
        course.updateDetails(newName, newDescription, newGrade, newGroup);

        // Then
        assertThat(course.getName()).isEqualTo(newName);
        assertThat(course.getDescription()).isEqualTo(newDescription);
        assertThat(course.getGrade()).isEqualTo(newGrade);
        assertThat(course.getGroup()).isEqualTo(newGroup);
    }

    @Test
    @DisplayName("Should set image URL")
    void shouldSetImageUrl() {
        // Given
        Course course = createValidCourse();
        String imageUrl = "https://example.com/new-image.jpg";

        // When
        course.setUrlImage(imageUrl);

        // Then
        assertThat(course.getUrlImage()).isEqualTo(imageUrl);
    }

    @Test
    @DisplayName("Should throw exception when setting empty image URL")
    void shouldThrowExceptionWhenSettingEmptyImageUrl() {
        // Given
        Course course = createValidCourse();

        // When/Then
        assertThatThrownBy(() -> course.setUrlImage("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("URL image cannot be empty string");
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Course createValidCourse() {
        return Course.create(
                new CourseCode(VALID_CODE),
                VALID_NAME,
                VALID_DESCRIPTION,
                VALID_GRADE,
                VALID_GROUP,
                VALID_TEACHER_ID
        );
    }
}