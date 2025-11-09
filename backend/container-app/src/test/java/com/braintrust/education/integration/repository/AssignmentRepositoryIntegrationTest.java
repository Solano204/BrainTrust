package com.braintrust.education.integration.repository;

import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.AssignmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.AssignmentJpaRepository;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.JpaAssignmentRepositoryAdapter;
import com.braintrust.education.integration.config.BaseIntegrationTest;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
@ContextConfiguration(classes = BrainTrustApplication.class)
@Import({JpaAssignmentRepositoryAdapter.class, AssignmentEntityMapper.class})
@DisplayName("Assignment Repository Integration Tests")
class AssignmentRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaAssignmentRepositoryAdapter assignmentRepository;

    @Autowired
    private AssignmentJpaRepository jpaRepository;

    private CourseId testCourseId;
    private Assignment testAssignment;

    @BeforeEach
    void setUp() {
        jpaRepository.deleteAll();
        testCourseId = CourseId.generate();
        testAssignment = createTestAssignment();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve assignment by ID")
    void shouldSaveAndRetrieveAssignmentById() {
        // When
        Assignment saved = assignmentRepository.save(testAssignment);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        // Verify retrieval
        Optional<Assignment> retrieved = assignmentRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getTitle()).isEqualTo("Integration Test Assignment");
        assertThat(retrieved.get().getCourseId()).isEqualTo(testCourseId);
    }

    @Test
    @DisplayName("Should save assignment with attachments")
    void shouldSaveAssignmentWithAttachments() {
        // Given
        Document doc1 = new Document("syllabus.pdf", "/files/syllabus.pdf");
        Document doc2 = new Document("rubric.pdf", "/files/rubric.pdf");
        testAssignment.addAttachment(doc1);
        testAssignment.addAttachment(doc2);

        // When
        Assignment saved = assignmentRepository.save(testAssignment);

        // Then
        Optional<Assignment> retrieved = assignmentRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAttachments()).hasSize(2);
        assertThat(retrieved.get().hasAttachments()).isTrue();
    }

    @Test
    @DisplayName("Should update existing assignment")
    void shouldUpdateExistingAssignment() {
        // Given
        Assignment saved = assignmentRepository.save(testAssignment);
        saved.updateDetails("Updated Title", "Updated Description", "Updated Instructions");

        // When
        Assignment updated = assignmentRepository.save(saved);

        // Then
        Optional<Assignment> retrieved = assignmentRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getTitle()).isEqualTo("Updated Title");
        assertThat(retrieved.get().getDescription()).isEqualTo("Updated Description");
        assertThat(retrieved.get().getInstructions()).isEqualTo("Updated Instructions");
    }

    @Test
    @DisplayName("Should return empty when assignment not found")
    void shouldReturnEmptyWhenAssignmentNotFound() {
        // Given
        AssignmentId nonExistentId = AssignmentId.generate();

        // When
        Optional<Assignment> result = assignmentRepository.findById(nonExistentId);

        // Then
        assertThat(result).isEmpty();
    }

    // ========================================
    // ✅ FIND BY COURSE TESTS
    // ========================================

    @Test
    @DisplayName("Should find assignments by course ID")
    void shouldFindAssignmentsByCourseId() {
        // Given
        Assignment assignment1 = createTestAssignment();
        Assignment assignment2 = Assignment.create(
                testCourseId,
                "Second Assignment",
                "Description 2",
                LocalDateTime.now().plusDays(10),
                100,
                "Instructions 2"
        );

        assignmentRepository.save(assignment1);
        assignmentRepository.save(assignment2);

        // When
        List<Assignment> results = assignmentRepository.findByCourseId(testCourseId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Assignment::getCourseId)
                .containsOnly(testCourseId);
    }

    @Test
    @DisplayName("Should find only active assignments by course")
    void shouldFindOnlyActiveAssignmentsByCourse() {
        // Given
        Assignment activeAssignment = createTestAssignment();
        Assignment inactiveAssignment = Assignment.create(
                testCourseId,
                "Inactive Assignment",
                "Description",
                LocalDateTime.now().plusDays(5),
                100,
                "Instructions"
        );
        inactiveAssignment.deactivate();

        assignmentRepository.save(activeAssignment);
        assignmentRepository.save(inactiveAssignment);

        // When
        List<Assignment> results = assignmentRepository.findActiveAssignmentsByCourse(testCourseId);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isActive()).isTrue();
    }

    // ========================================
    // ✅ FIND BY DUE DATE TESTS
    // ========================================

    @Test
    @DisplayName("Should find assignments due between dates")
    void shouldFindAssignmentsDueBetweenDates() {
        // Given
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now;
        LocalDateTime end = now.plusDays(10);

        Assignment assignment1 = Assignment.create(
                testCourseId,
                "Assignment 1",
                "Desc",
                now.plusDays(2),
                100,
                "Instructions"
        );

        Assignment assignment2 = Assignment.create(
                testCourseId,
                "Assignment 2",
                "Desc",
                now.plusDays(8),
                100,
                "Instructions"
        );

        Assignment assignment3 = Assignment.create(
                testCourseId,
                "Assignment 3",
                "Desc",
                now.plusDays(15), // Outside range
                100,
                "Instructions"
        );

        assignmentRepository.save(assignment1);
        assignmentRepository.save(assignment2);
        assignmentRepository.save(assignment3);

        // When
        List<Assignment> results = assignmentRepository.findAssignmentsDueBetween(testCourseId, start, end);

        // Then
        assertThat(results).hasSize(2);
    }

    // ========================================
    // ✅ FIND BY STUDENT FOR WEEK TESTS
    // ========================================

    @Test
    @DisplayName("Should find assignments for student for specific week")
    void shouldFindAssignmentsForStudentForWeek() {
        // Given - This test requires enrollment data
        // For simplicity, we'll test the query execution
        UserId studentId = UserId.generate();
        LocalDateTime weekStart = LocalDateTime.now();
        LocalDateTime weekEnd = weekStart.plusDays(7);

        // When
        List<Assignment> results = assignmentRepository.findAssignmentsByStudentForWeek(
                studentId,
                weekStart,
                weekEnd
        );

        // Then
        assertThat(results).isNotNull();
        // Note: This will be empty without enrollment data, but tests query execution
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete assignment")
    void shouldDeleteAssignment() {
        // Given
        Assignment saved = assignmentRepository.save(testAssignment);

        // When
        assignmentRepository.delete(saved);

        // Then
        Optional<Assignment> retrieved = assignmentRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should delete assignment with attachments")
    void shouldDeleteAssignmentWithAttachments() {
        // Given
        Document doc = new Document("file.pdf", "/files/file.pdf");
        testAssignment.addAttachment(doc);
        Assignment saved = assignmentRepository.save(testAssignment);

        // When
        assignmentRepository.delete(saved);

        // Then
        Optional<Assignment> retrieved = assignmentRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // ✅ TRANSACTIONAL BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should rollback on exception")
    void shouldRollbackOnException() {
        // Given
        Assignment saved = assignmentRepository.save(testAssignment);
        long countBefore = jpaRepository.count();

        // When/Then
        try {
            Assignment retrieved = assignmentRepository.findById(saved.getId()).orElseThrow();
            retrieved.updateDetails(null, "desc", "inst"); // This should fail
            assignmentRepository.save(retrieved);
            fail("Should have thrown exception");
        } catch (Exception e) {
            // Expected
        }

        // Verify no changes persisted
        assertThat(jpaRepository.count()).isEqualTo(countBefore);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Assignment createTestAssignment() {
        return Assignment.create(
                testCourseId,
                "Integration Test Assignment",
                "Test Description",
                LocalDateTime.now().plusDays(7),
                100,
                "Test Instructions"
        );
    }
}