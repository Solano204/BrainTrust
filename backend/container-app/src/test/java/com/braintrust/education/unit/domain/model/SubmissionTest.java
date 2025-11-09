package com.braintrust.education.unit.domain.model;



import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Submission Domain Model Tests")
class SubmissionTest {

    private static final AssignmentId VALID_ASSIGNMENT_ID = AssignmentId.generate();
    private static final UserId VALID_STUDENT_ID = UserId.generate();
    private static final String VALID_CONTENT = "This is my submission content";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create submission with valid data")
    void shouldCreateSubmissionWithValidData() {
        // When
        Submission submission = Submission.create(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );

        // Then
        assertThat(submission).isNotNull();
        assertThat(submission.getId()).isNotNull();
        assertThat(submission.getAssignmentId()).isEqualTo(VALID_ASSIGNMENT_ID);
        assertThat(submission.getStudentId()).isEqualTo(VALID_STUDENT_ID);
        assertThat(submission.getContent()).isEqualTo(VALID_CONTENT);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.SUBMITTED);
        assertThat(submission.getSubmittedAt()).isNotNull();
        assertThat(submission.getAttachments()).isEmpty();
        assertThat(submission.getGrade()).isNull();
        assertThat(submission.getTeacherFeedback()).isNull();
    }

    @Test
    @DisplayName("Should create submission with attachments")
    void shouldCreateSubmissionWithAttachments() {
        // Given
        List<Document> attachments = List.of(
                new Document("essay.pdf", "/submissions/essay.pdf"),
                new Document("code.zip", "/submissions/code.zip")
        );

        // When
        Submission submission = Submission.create(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                attachments,
                SubmissionStatus.SUBMITTED
        );

        // Then
        assertThat(submission.getAttachments()).hasSize(2);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when content is null or blank")
    void shouldThrowExceptionWhenContentIsNullOrBlank(String invalidContent) {
        // When/Then
        assertThatThrownBy(() ->
                Submission.create(
                        VALID_ASSIGNMENT_ID,
                        VALID_STUDENT_ID,
                        invalidContent,
                        Collections.emptyList(),
                        SubmissionStatus.SUBMITTED
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("content cannot be null or empty");
    }

    // ========================================
    // ✅ GRADING TESTS
    // ========================================

    @Test
    @DisplayName("Should grade submission successfully")
    void shouldGradeSubmissionSuccessfully() {
        // Given
        Submission submission = createValidSubmission();
        Grade grade = new Grade(new BigDecimal("85.50"), new BigDecimal("100.00"));
        String feedback = "Great work! Well organized and clear.";

        // When
        submission.grade(grade, feedback);

        // Then
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.GRADED);
        assertThat(submission.getGrade()).isEqualTo(grade);
        assertThat(submission.getTeacherFeedback()).isEqualTo(feedback);
        assertThat(submission.isGraded()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when grading non-submitted assignment")
    void shouldThrowExceptionWhenGradingNonSubmittedAssignment() {
        // Given
        Submission submission = Submission.create(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                Collections.emptyList(),
                SubmissionStatus.DRAFT
        );
        Grade grade = new Grade(new BigDecimal("90"), new BigDecimal("100"));

        // When/Then
        assertThatThrownBy(() -> submission.grade(grade, "Feedback"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only submitted assignments can be graded");
    }

    @Test
    @DisplayName("Should throw exception when grading already graded submission")
    void shouldThrowExceptionWhenGradingAlreadyGradedSubmission() {
        // Given
        Submission submission = createValidSubmission();
        Grade grade = new Grade(new BigDecimal("85"), new BigDecimal("100"));
        submission.grade(grade, "First feedback");

        // When/Then
        Grade newGrade = new Grade(new BigDecimal("90"), new BigDecimal("100"));
        assertThatThrownBy(() -> submission.grade(newGrade, "Second feedback"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only submitted assignments can be graded");
    }

    // ========================================
    // ✅ RETURN FOR REVISION TESTS
    // ========================================

    @Test
    @DisplayName("Should return submission for revision")
    void shouldReturnSubmissionForRevision() {
        // Given
        Submission submission = createValidSubmission();
        String feedback = "Please revise sections 2 and 3.";

        // When
        submission.returnForRevision(feedback);

        // Then
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.RETURNED);
        assertThat(submission.getTeacherFeedback()).isEqualTo(feedback);
    }

    @Test
    @DisplayName("Should throw exception when returning non-submitted assignment")
    void shouldThrowExceptionWhenReturningNonSubmittedAssignment() {
        // Given
        Submission submission = Submission.create(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                Collections.emptyList(),
                SubmissionStatus.GRADED
        );

        // When/Then
        assertThatThrownBy(() -> submission.returnForRevision("Feedback"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only submitted assignments can be returned for revision");
    }

    // ========================================
    // ✅ LATE SUBMISSION TESTS
    // ========================================

    @Test
    @DisplayName("Should detect late submission")
    void shouldDetectLateSubmission() {
        // Given
        Submission submission = createValidSubmission();
        LocalDateTime dueDate = submission.getSubmittedAt().minusDays(1);

        // When
        boolean isLate = submission.isLate(dueDate);

        // Then
        assertThat(isLate).isTrue();
    }

    @Test
    @DisplayName("Should detect on-time submission")
    void shouldDetectOnTimeSubmission() {
        // Given
        Submission submission = createValidSubmission();
        LocalDateTime dueDate = submission.getSubmittedAt().plusDays(1);

        // When
        boolean isLate = submission.isLate(dueDate);

        // Then
        assertThat(isLate).isFalse();
    }

    @Test
    @DisplayName("Should handle null due date")
    void shouldHandleNullDueDate() {
        // Given
        Submission submission = createValidSubmission();

        // When
        boolean isLate = submission.isLate(null);

        // Then
        assertThat(isLate).isFalse();
    }

    // ========================================
    // ✅ STATUS TESTS
    // ========================================

    @Test
    @DisplayName("Should check if submission is graded")
    void shouldCheckIfSubmissionIsGraded() {
        // Given
        Submission submission = createValidSubmission();
        Grade grade = new Grade(new BigDecimal("90"), new BigDecimal("100"));

        // When
        submission.grade(grade, "Good work");

        // Then
        assertThat(submission.isGraded()).isTrue();
    }

    @Test
    @DisplayName("Should return false for non-graded submission")
    void shouldReturnFalseForNonGradedSubmission() {
        // Given
        Submission submission = createValidSubmission();

        // Then
        assertThat(submission.isGraded()).isFalse();
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute submission from persistence")
    void shouldReconstituteSubmissionFromPersistence() {
        // Given
        SubmissionId id = SubmissionId.generate();
        LocalDateTime submittedAt = LocalDateTime.now().minusDays(2);
        Grade grade = new Grade(new BigDecimal("88"), new BigDecimal("100"));
        String feedback = "Excellent work";
        List<Document> attachments = List.of(
                new Document("file.pdf", "/files/file.pdf")
        );

        // When
        Submission submission = Submission.reconstitute(
                id,
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                attachments,
                submittedAt,
                SubmissionStatus.GRADED,
                grade,
                feedback
        );

        // Then
        assertThat(submission.getId()).isEqualTo(id);
        assertThat(submission.getSubmittedAt()).isEqualTo(submittedAt);
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.GRADED);
        assertThat(submission.getGrade()).isEqualTo(grade);
        assertThat(submission.getTeacherFeedback()).isEqualTo(feedback);
        assertThat(submission.getAttachments()).hasSize(1);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Submission createValidSubmission() {
        return Submission.create(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                Collections.emptyList(),
                SubmissionStatus.SUBMITTED
        );
    }
}