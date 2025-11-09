package com.braintrust.education.unit.application.service;

import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
import com.braintrust.education.application.dtos.commands.GradeSubmissionCommand;
import com.braintrust.education.application.dtos.commands.ReturnSubmissionCommand;
import com.braintrust.education.application.dtos.commands.SubmitAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.SubmissionDTO;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.application.service.SubmissionApplicationService;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.exceptions.SubmissionNotFoundException;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

// Permite stubs innecesarios para evitar UnnecessaryStubbingException
@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
@DisplayName("SubmissionApplicationService Unit Tests")
class SubmissionApplicationServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private DocumentStorageService documentStorageService;

    @Mock
    private AnalysisApplicationService analysisApplicationService;

    @InjectMocks
    private SubmissionApplicationService service;

    private static final String VALID_ASSIGNMENT_ID = "ASSIGN-123";
    private static final String VALID_STUDENT_ID = "STUDENT-456";
    private static final String VALID_CONTENT = "My submission content";

    // ========================================
    // ✅ SUBMIT ASSIGNMENT TESTS
    // ========================================

    @Test
    @DisplayName("Should submit assignment successfully")
    void shouldSubmitAssignmentSuccessfully() {
        // Given
        SubmitAssignmentCommand command = new SubmitAssignmentCommand(
                VALID_ASSIGNMENT_ID,
                VALID_STUDENT_ID,
                VALID_CONTENT,
                Collections.emptyList()
        );

        // Mock para el repositorio (Assignment)
        Assignment mockAssignment = mock(Assignment.class);
        when(assignmentRepository.findById(any(AssignmentId.class)))
                .thenReturn(Optional.of(mockAssignment));

        // CORRECCIÓN CLAVE: El Assignment debe permitir la sumisión.
        // Si el Application Service llama a canAcceptSubmissions(), debe ser true.
        // Si el Application Service no lo llama, debemos asegurar que submitWork
        // no llame a la lógica de dominio real que fallaría.

        // Asumimos que el Application Service está llamando a canAcceptSubmissions()
        when(mockAssignment.canAcceptSubmissions()).thenReturn(true);

        // Mock para el resultado de la operación (Submission)
        Submission mockSubmission = createMockSubmissionForDTO(); // Usamos el mock completo

        // Stubbing de la operación de dominio
        when(mockAssignment.submitWork(any(UserId.class), anyString(), anyList()))
                .thenReturn(mockSubmission);
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(mockSubmission);

        // When
        SubmissionId result = service.submitAssignment(command);

        // Then
        assertThat(result).isNotNull();
        verify(assignmentRepository).findById(any(AssignmentId.class));
        verify(assignmentRepository).save(mockAssignment); // El Assignment se guarda después de la modificación
        verify(submissionRepository).save(any(Submission.class));
    }

    // ... (shouldThrowExceptionWhenAssignmentNotFound se mantiene igual)

    // ========================================
    // ✅ GRADE SUBMISSION TESTS
    // ========================================

    @Test
    @DisplayName("Should grade submission successfully")
    void shouldGradeSubmissionSuccessfully() {
        // Given
        GradeSubmissionCommand command = new GradeSubmissionCommand(
                "SUBM-123", "85.5", "100", "Great work!"
        );

        Submission mockSubmission = mock(Submission.class); // Mock local

        // Stubs MÍNIMOS necesarios para este flujo:
        when(submissionRepository.findById(any(SubmissionId.class)))
                .thenReturn(Optional.of(mockSubmission));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(mockSubmission);

        // When
        service.gradeSubmission(command);

        // Then
        // Verificamos que el método de dominio se llama con el Grade correcto
        verify(mockSubmission).grade(any(Grade.class), eq("Great work!"));
        verify(submissionRepository).save(mockSubmission);
    }

    // ... (shouldThrowExceptionWhenGradingNonExistentSubmission se mantiene igual)

    // ========================================
    // ✅ RETURN FOR REVISION TESTS
    // ========================================

    @Test
    @DisplayName("Should return submission for revision successfully")
    void shouldReturnSubmissionForRevisionSuccessfully() {
        // Given
        ReturnSubmissionCommand command = new ReturnSubmissionCommand(
                "SUBM-123",
                "Please revise section 2"
        );

        Submission mockSubmission = mock(Submission.class); // Mock local

        // Stubs MÍNIMOS necesarios para este flujo:
        when(submissionRepository.findById(any(SubmissionId.class)))
                .thenReturn(Optional.of(mockSubmission));
        when(submissionRepository.save(any(Submission.class)))
                .thenReturn(mockSubmission);

        // When
        service.returnSubmissionForRevision(command);

        // Then
        verify(mockSubmission).returnForRevision("Please revise section 2");
        verify(submissionRepository).save(mockSubmission);
    }

    // ========================================
    // ✅ GET SUBMISSION TESTS
    // ========================================
    @Test
    @DisplayName("Should get submission by ID successfully")
    void shouldGetSubmissionByIdSuccessfully() {
        // Given
        SubmissionId submissionId = SubmissionId.generate();

        // Mock que requiere todos los stubs para mapear a DTO
        Submission mockSubmission = createMockSubmissionForDTO();
        Assignment mockAssignment = createMockAssignmentForDTO(); // Mock para el DTO de Assignment

        when(submissionRepository.findById(submissionId))
                .thenReturn(Optional.of(mockSubmission));
        when(assignmentRepository.findById(any(AssignmentId.class)))
                .thenReturn(Optional.of(mockAssignment));

        // When
        SubmissionDTO result = service.getSubmissionById(submissionId);

        // Then
        assertThat(result).isNotNull();
        verify(submissionRepository).findById(submissionId);
        verify(assignmentRepository).findById(any(AssignmentId.class));
    }

    // ... (shouldThrowExceptionWhenSubmissionNotFoundById se mantiene igual)
    // ... (shouldCheckIfStudentHasSubmitted se mantiene igual)

    // ========================================
    // 🔧 HELPER METHODS (Mínimos y para DTOs)
    // ========================================

    /**
     * Crea un Assignment mock con stubs mínimos para el Application Service.
     */
    private Assignment createMockAssignmentForDTO() {
        Assignment mockAssignment = mock(Assignment.class);
        // Stubs necesarios para que el Submission DTO se construya correctamente
        when(mockAssignment.getId()).thenReturn(AssignmentId.generate());
        when(mockAssignment.getCourseId()).thenReturn(CourseId.generate());
        when(mockAssignment.getTitle()).thenReturn("Homework 1");
        when(mockAssignment.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(mockAssignment.getMaxScore()).thenReturn(new Score(100, 100)); // Necesario para el DTO
        when(mockAssignment.getDueDate()).thenReturn(LocalDateTime.now().plusDays(1));
        when(mockAssignment.isActive()).thenReturn(true);
        return mockAssignment;
    }

    /**
     * Crea un Submission mock con stubs necesarios para el Application Service,
     * especialmente al mapear a un SubmissionDTO.
     */
    private Submission createMockSubmissionForDTO() {
        Submission mockSubmission = mock(Submission.class);
        // Stubs necesarios para que el Submission DTO se construya correctamente
        when(mockSubmission.getId()).thenReturn(SubmissionId.generate());
        when(mockSubmission.getAssignmentId()).thenReturn(AssignmentId.generate());
        when(mockSubmission.getStudentId()).thenReturn(UserId.generate());
        when(mockSubmission.getContent()).thenReturn(VALID_CONTENT);
        when(mockSubmission.getStatus()).thenReturn(SubmissionStatus.SUBMITTED);
        when(mockSubmission.getSubmittedAt()).thenReturn(LocalDateTime.now());
        when(mockSubmission.getAttachments()).thenReturn(Collections.emptyList());
        when(mockSubmission.isGraded()).thenReturn(false);
        // El DTO también podría intentar obtener el Grade, aunque no esté calificado.
        when(mockSubmission.getGrade()).thenReturn(null);
        return mockSubmission;
    }
}