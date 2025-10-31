package com.braintrust.education.application.ports.in;


import com.braintrust.education.application.dtos.commands.CreateAssignmentCommand;
import com.braintrust.education.application.dtos.commands.CreateAssignmentWithAttachmentsCommand;
import com.braintrust.education.application.dtos.commands.UpdateAssignmentCommand;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.time.LocalDateTime;
import java.util.List;

// 📍 education/application/ports/in/AssignmentService.java
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

    // Queries
    AssignmentDTO getAssignmentById(AssignmentId assignmentId);
    List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId);
    List<AssignmentDTO> getActiveAssignmentsByCourse(CourseId courseId);
    List<AssignmentDTO> getAssignmentsDueSoon(CourseId courseId, int daysAhead);
    boolean canAcceptSubmissions(AssignmentId assignmentId);
    int getAttachmentCount(AssignmentId assignmentId);
    List<AssignmentDTO> getAssignmentsForStudentWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<AssignmentDTO> getAssignmentsForTeacherWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);

}
