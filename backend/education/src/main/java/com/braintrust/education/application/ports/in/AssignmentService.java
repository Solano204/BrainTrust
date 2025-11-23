package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.CreateAssignmentCommand;
import com.braintrust.education.application.dtos.commands.CreateAssignmentWithAttachmentsCommand;
import com.braintrust.education.application.dtos.commands.CreateTeamAssignmentCommand;
import com.braintrust.education.application.dtos.commands.UpdateAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;

public interface AssignmentService {

    // Commands
    AssignmentId createAssignment(CreateAssignmentCommand command);
    AssignmentId createAssignmentWithAttachments(CreateAssignmentWithAttachmentsCommand command);
    void updateAssignmentDetails(UpdateAssignmentCommand command);
    void addAttachment(AssignmentId assignmentId, Document document);
    void removeAttachment(AssignmentId assignmentId, Document document);
    void clearAttachments(AssignmentId assignmentId);
    void extendDueDate(AssignmentId assignmentId, LocalDateTime newDueDate);
    void activateAssignment(AssignmentId assignmentId);
    void deactivateAssignment(AssignmentId assignmentId);
    AssignmentId createAssignmentForTeam(CreateTeamAssignmentCommand command);

    // NEW: Delete assignment
    void deleteAssignment(AssignmentId assignmentId);

    // Queries
    /*
    AssignmentDTO getAssignmentById(AssignmentId assignmentId);
    */

    List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId);

    // NEW: Get assignments by unit
    List<AssignmentDTO> getAssignmentsByUnit(CourseId courseId, UnitId unitId);

    /*
    List<AssignmentDTO> getActiveAssignmentsByCourse(CourseId courseId);
    */

    /*
    List<AssignmentDTO> getAssignmentsDueSoon(CourseId courseId, int daysAhead);
    */

    /*
    boolean canAcceptSubmissions(AssignmentId assignmentId);
    */

    /*
    int getAttachmentCount(AssignmentId assignmentId);
    */

    List<AssignmentDTO> getAssignmentsForStudentWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<AssignmentDTO> getAssignmentsForTeacherWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);

    // NEW: Month calendar queries
    List<AssignmentDTO> getAssignmentsForStudentMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<AssignmentDTO> getAssignmentsForTeacherMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd);
}