package com.braintrust.education.unit.domain.model;


import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Assignment Domain Model Tests")
class AssignmentTest {

    private static final CourseId VALID_COURSE_ID = CourseId.generate();
    private static final String VALID_TITLE = "Final Exam";
    private static final String VALID_DESCRIPTION = "Final exam covering all topics";
    private static final LocalDateTime VALID_DUE_DATE = LocalDateTime.now().plusDays(7);
    private static final int VALID_MAX_POINTS = 100;
    private static final String VALID_INSTRUCTIONS = "Answer all questions";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create assignment with valid data")
    void shouldCreateAssignmentWithValidData() {
        // When
        Assignment assignment = Assignment.create(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                VALID_DUE_DATE,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS
        );

        // Then
        assertThat(assignment).isNotNull();
        assertThat(assignment.getId()).isNotNull();
        assertThat(assignment.getCourseId()).isEqualTo(VALID_COURSE_ID);
        assertThat(assignment.getTitle()).isEqualTo(VALID_TITLE);
        assertThat(assignment.getDescription()).isEqualTo(VALID_DESCRIPTION);
        assertThat(assignment.getDueDate()).isEqualTo(VALID_DUE_DATE);
        assertThat(assignment.getMaxScore().getValue()).isEqualTo(VALID_MAX_POINTS);
        assertThat(assignment.getInstructions()).isEqualTo(VALID_INSTRUCTIONS);
        assertThat(assignment.isActive()).isTrue();
        assertThat(assignment.getCreatedAt()).isNotNull();
        assertThat(assignment.getAttachments()).isEmpty();
    }

    @Test
    @DisplayName("Should create assignment with attachments")
    void shouldCreateAssignmentWithAttachments() {
        // Given
        List<Document> attachments = List.of(
                new Document("syllabus.pdf", "/files/syllabus.pdf"),
                new Document("rubric.pdf", "/files/rubric.pdf")
        );

        // When
        Assignment assignment = Assignment.createWithAttachments(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                VALID_DUE_DATE,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS,
                attachments
        );

        // Then
        assertThat(assignment.getAttachments()).hasSize(2);
        assertThat(assignment.hasAttachments()).isTrue();
        assertThat(assignment.getAttachmentCount()).isEqualTo(2);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    @DisplayName("Should throw exception when title is null or blank")
    void shouldThrowExceptionWhenTitleIsNullOrBlank(String invalidTitle) {
        // When/Then
        assertThatThrownBy(() ->
                Assignment.create(
                        VALID_COURSE_ID,
                        invalidTitle,
                        VALID_DESCRIPTION,
                        VALID_DUE_DATE,
                        VALID_MAX_POINTS,
                        VALID_INSTRUCTIONS
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("title cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when title exceeds 255 characters")
    void shouldThrowExceptionWhenTitleExceedsMaxLength() {
        // Given
        String longTitle = "A".repeat(256);

        // When/Then
        assertThatThrownBy(() ->
                Assignment.create(
                        VALID_COURSE_ID,
                        longTitle,
                        VALID_DESCRIPTION,
                        VALID_DUE_DATE,
                        VALID_MAX_POINTS,
                        VALID_INSTRUCTIONS
                )
        ).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot exceed 255 characters");
    }

    // ========================================
    // ✅ ATTACHMENT MANAGEMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should add attachment successfully")
    void shouldAddAttachmentSuccessfully() {
        // Given
        Assignment assignment = createValidAssignment();
        Document document = new Document("test.pdf", "/files/test.pdf");

        // When
        assignment.addAttachment(document);

        // Then
        assertThat(assignment.getAttachments()).hasSize(1);
        assertThat(assignment.hasAttachments()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when adding null attachment")
    void shouldThrowExceptionWhenAddingNullAttachment() {
        // Given
        Assignment assignment = createValidAssignment();

        // When/Then
        assertThatThrownBy(() -> assignment.addAttachment(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Document cannot be null");
    }

    @Test
    @DisplayName("Should throw exception when exceeding max attachments")
    void shouldThrowExceptionWhenExceedingMaxAttachments() {
        // Given
        Assignment assignment = createValidAssignment();

        // Add 10 attachments (max limit)
        for (int i = 0; i < 10; i++) {
            assignment.addAttachment(new Document("file" + i + ".pdf", "/files/file" + i + ".pdf"));
        }

        // When/Then
        assertThatThrownBy(() ->
                assignment.addAttachment(new Document("extra.pdf", "/files/extra.pdf"))
        ).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot add more than 10 attachments");
    }

    @Test
    @DisplayName("Should remove attachment successfully")
    void shouldRemoveAttachmentSuccessfully() {
        // Given
        Assignment assignment = createValidAssignment();
        Document document = new Document("test.pdf", "/files/test.pdf");
        assignment.addAttachment(document);

        // When
        assignment.removeAttachment(document);

        // Then
        assertThat(assignment.getAttachments()).isEmpty();
        assertThat(assignment.hasAttachments()).isFalse();
    }

    @Test
    @DisplayName("Should throw exception when removing non-existent attachment")
    void shouldThrowExceptionWhenRemovingNonExistentAttachment() {
        // Given
        Assignment assignment = createValidAssignment();
        Document nonExistentDoc = new Document("missing.pdf", "/files/missing.pdf");

        // When/Then
        assertThatThrownBy(() -> assignment.removeAttachment(nonExistentDoc))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Document not found in attachments");
    }

    @Test
    @DisplayName("Should clear all attachments")
    void shouldClearAllAttachments() {
        // Given
        Assignment assignment = createValidAssignment();
        assignment.addAttachment(new Document("file1.pdf", "/files/file1.pdf"));
        assignment.addAttachment(new Document("file2.pdf", "/files/file2.pdf"));

        // When
        assignment.clearAttachments();

        // Then
        assertThat(assignment.getAttachments()).isEmpty();
        assertThat(assignment.getAttachmentCount()).isZero();
    }

    // ========================================
    // ✅ SUBMISSION BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should submit work successfully when active and before due date")
    void shouldSubmitWorkSuccessfullyWhenActiveAndBeforeDueDate() {
        // Given
        Assignment assignment = createValidAssignment();
        UserId studentId = UserId.generate();
        String content = "My submission content";
        List<Document> attachments = Collections.emptyList();

        // When
        Submission submission = assignment.submitWork(studentId, content, attachments);

        // Then
        assertThat(submission).isNotNull();
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.SUBMITTED);
        assertThat(submission.getStudentId()).isEqualTo(studentId);
        assertThat(assignment.getSubmissions()).hasSize(1);
    }

    @Test
    @DisplayName("Should create late submission when active but past due date")
    void shouldCreateLateSubmissionWhenPastDueDate() {
        // Given
        LocalDateTime pastDueDate = LocalDateTime.now().minusDays(1);
        Assignment assignment = Assignment.create(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                pastDueDate,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS
        );
        UserId studentId = UserId.generate();

        // When
        Submission submission = assignment.submitWork(studentId, "Late submission", Collections.emptyList());

        // Then
        assertThat(submission.getStatus()).isEqualTo(SubmissionStatus.LATE_SUBMITTED);
    }

    @Test
    @DisplayName("Should throw exception when submitting to inactive assignment past due date")
    void shouldThrowExceptionWhenSubmittingToInactiveAssignmentPastDueDate() {
        // Given
        LocalDateTime pastDueDate = LocalDateTime.now().minusDays(1);
        Assignment assignment = Assignment.create(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                pastDueDate,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS
        );
        assignment.deactivate();

        // When/Then
        assertThatThrownBy(() ->
                assignment.submitWork(UserId.generate(), "content", Collections.emptyList())
        ).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Assignment is closed and cannot accept submissions");
    }

    @Test
    @DisplayName("Should accept submissions when active regardless of due date")
    void shouldAcceptSubmissionsWhenActive() {
        // Given
        LocalDateTime pastDueDate = LocalDateTime.now().minusDays(5);
        Assignment assignment = Assignment.create(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                pastDueDate,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS
        );
        // Assignment is active by default

        // Then
        assertThat(assignment.canAcceptSubmissions()).isTrue();
    }

    // ========================================
    // ✅ STATE MANAGEMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should activate assignment")
    void shouldActivateAssignment() {
        // Given
        Assignment assignment = createValidAssignment();
        assignment.deactivate();

        // When
        assignment.activate();

        // Then
        assertThat(assignment.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should deactivate assignment")
    void shouldDeactivateAssignment() {
        // Given
        Assignment assignment = createValidAssignment();

        // When
        assignment.deactivate();

        // Then
        assertThat(assignment.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should extend due date successfully")
    void shouldExtendDueDateSuccessfully() {
        // Given
        Assignment assignment = createValidAssignment();
        LocalDateTime newDueDate = LocalDateTime.now().plusDays(14);

        // When
        assignment.extendDueDate(newDueDate);

        // Then
        assertThat(assignment.getDueDate()).isEqualTo(newDueDate);
    }

    @Test
    @DisplayName("Should throw exception when extending due date before creation date")
    void shouldThrowExceptionWhenExtendingDueDateBeforeCreationDate() {
        // Given
        Assignment assignment = createValidAssignment();
        LocalDateTime pastDate = assignment.getCreatedAt().minusDays(1);

        // When/Then
        assertThatThrownBy(() -> assignment.extendDueDate(pastDate))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Due date must be after creation date");
    }

    @Test
    @DisplayName("Should update assignment details")
    void shouldUpdateAssignmentDetails() {
        // Given
        Assignment assignment = createValidAssignment();
        String newTitle = "Updated Title";
        String newDescription = "Updated Description";
        String newInstructions = "Updated Instructions";

        // When
        assignment.updateDetails(newTitle, newDescription, newInstructions);

        // Then
        assertThat(assignment.getTitle()).isEqualTo(newTitle);
        assertThat(assignment.getDescription()).isEqualTo(newDescription);
        assertThat(assignment.getInstructions()).isEqualTo(newInstructions);
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute assignment from persistence")
    void shouldReconstituteAssignmentFromPersistence() {
        // Given
        AssignmentId id = AssignmentId.generate();
        LocalDateTime createdAt = LocalDateTime.now().minusDays(5);
        List<Document> attachments = List.of(new Document("doc.pdf", "/files/doc.pdf"));
        List<Submission> submissions = new ArrayList<>();
        Score score = new Score(80, 100);

        // When
        Assignment assignment = Assignment.reconstitute(
                id,
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                createdAt,
                attachments,
                VALID_DUE_DATE,
                score,
                VALID_INSTRUCTIONS,
                submissions,
                true
        );

        // Then
        assertThat(assignment.getId()).isEqualTo(id);
        assertThat(assignment.getCreatedAt()).isEqualTo(createdAt);
        assertThat(assignment.getAttachments()).hasSize(1);
        assertThat(assignment.isActive()).isTrue();
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Assignment createValidAssignment() {
        return Assignment.create(
                VALID_COURSE_ID,
                VALID_TITLE,
                VALID_DESCRIPTION,
                VALID_DUE_DATE,
                VALID_MAX_POINTS,
                VALID_INSTRUCTIONS
        );
    }
}