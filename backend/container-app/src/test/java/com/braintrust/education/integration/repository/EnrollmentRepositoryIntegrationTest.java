package com.braintrust.education.integration.repository;

import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.EnrollmentJpaRepository;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.EnrollmentRepositoryAdapter;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.EnrollmentEntityMapper;
import com.braintrust.education.integration.config.BaseIntegrationTest;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@ContextConfiguration(classes = BrainTrustApplication.class)
@Import({EnrollmentRepositoryAdapter.class, EnrollmentEntityMapper.class, TestEnrollmentHelper.class})
@DisplayName("Enrollment Repository Integration Tests")
class EnrollmentRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private EnrollmentRepositoryAdapter enrollmentRepository;

    @Autowired
    private EnrollmentJpaRepository jpaRepository;

    @Autowired
    private TestEnrollmentHelper testHelper; // ⬅️ NEW: Test helper

    private CourseId testCourseId;
    private UserId testStudentId;
    private Enrollment testEnrollment;

    @BeforeEach
    void setUp() {
        testHelper.deleteAll(); // Use helper instead of jpaRepository.deleteAll()
        testCourseId = CourseId.generate();
        testStudentId = UserId.generate();
        testEnrollment = createTestEnrollment();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve enrollment by ID")
    void shouldSaveAndRetrieveEnrollmentById() {
        // When - Use helper to insert
        testHelper.insertEnrollment(testEnrollment);

        // Then - Use repository to retrieve
        Optional<Enrollment> retrieved = enrollmentRepository.findById(testEnrollment.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getCourseId()).isEqualTo(testCourseId);
        assertThat(retrieved.get().getStudentId()).isEqualTo(testStudentId);
        assertThat(retrieved.get().getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should update existing enrollment")
    void shouldUpdateExistingEnrollment() {
        // Given
        testHelper.insertEnrollment(testEnrollment);

        // When - Modify and update
        Grade finalGrade = new Grade(new BigDecimal("88.5"), new BigDecimal("100"));
        testEnrollment.complete(finalGrade);
        testHelper.updateEnrollment(testEnrollment);

        // Then
        Optional<Enrollment> retrieved = enrollmentRepository.findById(testEnrollment.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(retrieved.get().getFinalGrade()).isNotNull();
    }

    // ========================================
    // ✅ FIND BY COURSE AND STUDENT TESTS
    // ========================================

    @Test
    @DisplayName("Should find enrollment by course and student")
    void shouldFindEnrollmentByCourseAndStudent() {
        // Given
        testHelper.insertEnrollment(testEnrollment);

        // When
        Optional<Enrollment> result = enrollmentRepository.findByCourseAndStudent(
                testCourseId,
                testStudentId
        );

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCourseId()).isEqualTo(testCourseId);
        assertThat(result.get().getStudentId()).isEqualTo(testStudentId);
    }

    @Test
    @DisplayName("Should return empty when enrollment not found")
    void shouldReturnEmptyWhenEnrollmentNotFound() {
        // Given
        CourseId nonExistentCourse = CourseId.generate();
        UserId nonExistentStudent = UserId.generate();

        // When
        Optional<Enrollment> result = enrollmentRepository.findByCourseAndStudent(
                nonExistentCourse,
                nonExistentStudent
        );

        // Then
        assertThat(result).isEmpty();
    }

    // ========================================
    // ✅ FIND BY COURSE TESTS
    // ========================================

    @Test
    @DisplayName("Should find enrollments by course ID")
    void shouldFindEnrollmentsByCourseId() {
        // Given
        UserId student1 = UserId.generate();
        UserId student2 = UserId.generate();

        Enrollment enroll1 = Enrollment.create(testCourseId, student1);
        Enrollment enroll2 = Enrollment.create(testCourseId, student2);

        testHelper.insertEnrollment(enroll1);
        testHelper.insertEnrollment(enroll2);

        // When
        List<Enrollment> results = enrollmentRepository.findByCourseId(testCourseId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Enrollment::getCourseId)
                .containsOnly(testCourseId);
    }

    // ========================================
    // ✅ FIND BY STUDENT TESTS
    // ========================================

    @Test
    @DisplayName("Should find enrollments by student ID")
    void shouldFindEnrollmentsByStudentId() {
        // Given
        CourseId course1 = CourseId.generate();
        CourseId course2 = CourseId.generate();

        Enrollment enroll1 = Enrollment.create(course1, testStudentId);
        Enrollment enroll2 = Enrollment.create(course2, testStudentId);

        testHelper.insertEnrollment(enroll1);
        testHelper.insertEnrollment(enroll2);

        // When
        List<Enrollment> results = enrollmentRepository.findByStudentId(testStudentId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Enrollment::getStudentId)
                .containsOnly(testStudentId);
    }

    // ========================================
    // ✅ FIND ACTIVE ENROLLMENTS TESTS
    // ========================================

    @Test
    @DisplayName("Should find only active enrollments for course")
    void shouldFindOnlyActiveEnrollmentsForCourse() {
        // Given
        Enrollment activeEnrollment = Enrollment.create(testCourseId, testStudentId);

        UserId student2 = UserId.generate();
        Enrollment cancelledEnrollment = Enrollment.create(testCourseId, student2);
        cancelledEnrollment.cancel();

        testHelper.insertEnrollment(activeEnrollment);
        testHelper.insertEnrollment(cancelledEnrollment);

        // When
        List<Enrollment> results = enrollmentRepository.findActiveEnrollments(testCourseId);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isActive()).isTrue();
    }

    // ========================================
    // ✅ EXISTS TESTS
    // ========================================

    @Test
    @DisplayName("Should check if enrollment exists")
    void shouldCheckIfEnrollmentExists() {
        // Given
        testHelper.insertEnrollment(testEnrollment);

        // When
        boolean exists = enrollmentRepository.existsByCourseAndStudent(
                testCourseId,
                testStudentId
        );

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when enrollment does not exist")
    void shouldReturnFalseWhenEnrollmentDoesNotExist() {
        // Given
        CourseId nonExistentCourse = CourseId.generate();
        UserId nonExistentStudent = UserId.generate();

        // When
        boolean exists = enrollmentRepository.existsByCourseAndStudent(
                nonExistentCourse,
                nonExistentStudent
        );

        // Then
        assertThat(exists).isFalse();
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete enrollment")
    void shouldDeleteEnrollment() {
        // Given
        testHelper.insertEnrollment(testEnrollment);

        // When
        enrollmentRepository.delete(testEnrollment);

        // Then
        Optional<Enrollment> retrieved = enrollmentRepository.findById(testEnrollment.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // ✅ STATUS TRANSITION TESTS
    // ========================================

    @Test
    @DisplayName("Should handle enrollment status transitions")
    void shouldHandleEnrollmentStatusTransitions() {
        // Given - Active enrollment
        testHelper.insertEnrollment(testEnrollment);
        assertThat(testEnrollment.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);

        // When - Complete enrollment
        Grade finalGrade = new Grade(new BigDecimal("92"), new BigDecimal("100"));
        testEnrollment.complete(finalGrade);
        testHelper.updateEnrollment(testEnrollment);

        // Then
        Optional<Enrollment> retrieved = enrollmentRepository.findById(testEnrollment.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(EnrollmentStatus.COMPLETED);
        assertThat(retrieved.get().getFinalGrade()).isNotNull();
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Enrollment createTestEnrollment() {
        return Enrollment.create(testCourseId, testStudentId);
    }
}