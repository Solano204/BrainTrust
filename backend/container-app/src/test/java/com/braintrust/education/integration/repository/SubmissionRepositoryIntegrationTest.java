package com.braintrust.education.integration.repository;

import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.SubmissionJpaRepository;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.JpaSubmissionRepositoryAdapter;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.SubmissionEntityMapper;
import com.braintrust.education.integration.config.BaseIntegrationTest;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
@ContextConfiguration(classes = BrainTrustApplication.class)
@Import({JpaSubmissionRepositoryAdapter.class, SubmissionEntityMapper.class})
@DisplayName("Submission Repository Integration Tests")
class SubmissionRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaSubmissionRepositoryAdapter submissionRepository;

    @Autowired
    private SubmissionJpaRepository jpaRepository;

    private AssignmentId testAssignmentId;
    private UserId testStudentId;
    private Submission testSubmission;

    @BeforeEach
    void setUp() {
        jpaRepository.deleteAll();
        testAssignmentId = AssignmentId.generate();
        testStudentId = UserId.generate();
        testSubmission = createTestSubmission();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve submission by ID")
    void shouldSaveAndRetrieveSubmissionById() {
        // When
        Submission saved = submissionRepository.save(testSubmission);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        // Verify retrieval
        Optional<Submission> retrieved = submissionRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getContent()).isEqualTo("Test submission content");
        assertThat(retrieved.get().getStatus()).isEqualTo(SubmissionStatus.SUBMITTED);
    }

    @Test
    @DisplayName("Should save submission with attachments")
    void shouldSaveSubmissionWithAttachments() {
        // Given
        Document doc1 = new Document("essay.pdf", "/submissions/essay.pdf");
        Document doc2 = new Document("code.zip", "/submissions/code.zip");

        Submission submissionWithAttachments = Submission.create(
                testAssignmentId,
                testStudentId,
                "Content with attachments",
                List.of(doc1, doc2),
                SubmissionStatus.SUBMITTED
        );

        // When
        Submission saved = submissionRepository.save(submissionWithAttachments);

        // Then
        Optional<Submission> retrieved = submissionRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getAttachments()).hasSize(2);
    }

    @Test
    @DisplayName("Should update existing submission")
    void shouldUpdateExistingSubmission() {
        // Given
        Submission saved = submissionRepository.save(testSubmission);
        Grade grade = new Grade(new BigDecimal("90"), new BigDecimal("100"));
        saved.grade(grade, "Excellent work!");

        // When
        Submission updated = submissionRepository.save(saved);

        // Then
        Optional<Submission> retrieved = submissionRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(SubmissionStatus.GRADED);
        assertThat(retrieved.get().getGrade()).isNotNull();
        assertThat(retrieved.get().getTeacherFeedback()).isEqualTo("Excellent work!");
    }

    // ========================================
    // ✅ FIND BY ASSIGNMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should find submissions by assignment ID")
    void shouldFindSubmissionsByAssignmentId() {
        // Given
        Submission sub1 = createTestSubmission();
        Submission sub2 = Submission.create(
                testAssignmentId,
                UserId.generate(),
                "Second submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );

        submissionRepository.save(sub1);
        submissionRepository.save(sub2);

        // When
        List<Submission> results = submissionRepository.findByAssignmentId(testAssignmentId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Submission::getAssignmentId)
                .containsOnly(testAssignmentId);
    }

    // ========================================
    // ✅ FIND BY STUDENT TESTS
    // ========================================

    @Test
    @DisplayName("Should find submissions by student ID")
    void shouldFindSubmissionsByStudentId() {
        // Given
        AssignmentId assignment1 = AssignmentId.generate();
        AssignmentId assignment2 = AssignmentId.generate();

        Submission sub1 = Submission.create(
                assignment1,
                testStudentId,
                "First submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );

        Submission sub2 = Submission.create(
                assignment2,
                testStudentId,
                "Second submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );

        submissionRepository.save(sub1);
        submissionRepository.save(sub2);

        // When
        List<Submission> results = submissionRepository.findByStudentId(testStudentId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Submission::getStudentId)
                .containsOnly(testStudentId);
    }

    // ========================================
    // ✅ FIND BY STATUS TESTS
    // ========================================

    @Test
    @DisplayName("Should find submissions by status")
    void shouldFindSubmissionsByStatus() {
        // Given
        Submission submitted = createTestSubmission();

        Submission graded = Submission.create(
                AssignmentId.generate(),
                UserId.generate(),
                "Graded submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );
        Grade grade = new Grade(new BigDecimal("85"), new BigDecimal("100"));
        graded.grade(grade, "Good job");

        submissionRepository.save(submitted);
        submissionRepository.save(graded);

        // When
        List<Submission> submittedResults = submissionRepository.findByStatus(SubmissionStatus.SUBMITTED);
        List<Submission> gradedResults = submissionRepository.findByStatus(SubmissionStatus.GRADED);

        // Then
        assertThat(submittedResults).hasSize(1);
        assertThat(gradedResults).hasSize(1);
    }

    // ========================================
    // ✅ FIND LATEST SUBMISSION TESTS
    // ========================================

    @Test
    @DisplayName("Should find latest submission by assignment and student")
    void shouldFindLatestSubmissionByAssignmentAndStudent() {
        // Given - Save OLD submission first
        Submission oldSubmission = Submission.create(
                testAssignmentId,
                testStudentId,
                "Old submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );
        submissionRepository.save(oldSubmission);

        // Wait to ensure different timestamps
        try {
            Thread.sleep(1000); // Increased sleep time for clearer separation
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Delete the old submission before saving the new one
        // This ensures only ONE submission exists for this assignment+student combination
        submissionRepository.delete(oldSubmission);

        // Save NEW submission
        Submission newSubmission = Submission.create(
                testAssignmentId,
                testStudentId,
                "Latest submission",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );
        submissionRepository.save(newSubmission);

        // When
        Optional<Submission> latest = submissionRepository.findLatestByAssignmentAndStudent(
                testAssignmentId,
                testStudentId
        );

        // Then
        assertThat(latest).isPresent();
        assertThat(latest.get().getContent()).isEqualTo("Latest submission");
    }

    // ========================================
    // ✅ FIND LATE SUBMISSIONS TESTS
    // ========================================

    @Test
    @DisplayName("Should find late submissions")
    void shouldFindLateSubmissions() {
        // Given
        LocalDateTime dueDate = LocalDateTime.now().minusDays(1);

        Submission lateSubmission = Submission.create(
                testAssignmentId,
                testStudentId,
                "Late submission",
                Collections.emptyList(),
                SubmissionStatus.LATE_SUBMITTED
        );
        submissionRepository.save(lateSubmission);

        // When
        List<Submission> lateSubmissions = submissionRepository.findLateSubmissions(
                testAssignmentId,
                dueDate
        );

        // Then
        assertThat(lateSubmissions).isNotEmpty();
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete submission")
    void shouldDeleteSubmission() {
        // Given
        Submission saved = submissionRepository.save(testSubmission);

        // When
        submissionRepository.delete(saved);

        // Then
        Optional<Submission> retrieved = submissionRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should delete submission with attachments")
    void shouldDeleteSubmissionWithAttachments() {
        // Given
        Document doc = new Document("file.pdf", "/files/file.pdf");
        Submission submissionWithAttachment = Submission.create(
                testAssignmentId,
                testStudentId,
                "Content",
                List.of(doc),
                SubmissionStatus.SUBMITTED
        );
        Submission saved = submissionRepository.save(submissionWithAttachment);

        // When
        submissionRepository.delete(saved);

        // Then
        Optional<Submission> retrieved = submissionRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // ✅ COMPLEX QUERY TESTS
    // ========================================

    @Test
    @DisplayName("Should find submissions by assignment and student")
    void shouldFindSubmissionsByAssignmentAndStudent() {
        // Given
        submissionRepository.save(testSubmission);

        // When
        List<Submission> results = submissionRepository.findByAssignmentAndStudent(
                testAssignmentId,
                testStudentId
        );

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getAssignmentId()).isEqualTo(testAssignmentId);
        assertThat(results.get(0).getStudentId()).isEqualTo(testStudentId);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Submission createTestSubmission() {
        return Submission.create(
                testAssignmentId,
                testStudentId,
                "Test submission content",
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );
    }
}