package com.braintrust.education.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.web.multipart.MultipartFile;

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
    void deleteAssignment(AssignmentId assignmentId);
    AssignmentId createAssignmentFrontend(CreateAssignmentFrontendDTO command);
//    AssignmentId createAssignmentWithAttachmentsFrontend(CreateAssignmentWithAttachmentsCommand command);
    // ✅ ADDED - Link management methods

    // In AssignmentService interface, add these methods:

    // For bulk JSON attachments
    void addBulkAttachmentsJson(AssignmentId assignmentId, List<FrontendDocumentDTO> attachments);

    // For single JSON attachment
    void addSingleAttachmentJson(AssignmentId assignmentId, FrontendDocumentDTO attachment);

    void addLink(AssignmentId assignmentId, String link);
    void addLinks(AssignmentId assignmentId, List<String> links);
    void removeLink(AssignmentId assignmentId, String link);
    void clearLinks(AssignmentId assignmentId);

    // ✅ ADDED - File management methods
    void addAttachment(AssignmentId assignmentId, MultipartFile file);
    void addMultipleAttachments(AssignmentId assignmentId, List<MultipartFile> files);
    void removeAttachment(AssignmentId assignmentId, String documentName);
    // Queries
    AssignmentDTO getAssignmentById(AssignmentId assignmentId);
    List<AssignmentDTO> getAssignmentsByCourse(CourseId courseId);
    List<AssignmentDTO> getAssignmentsByUnit(CourseId courseId, UnitId unitId);
    List<AssignmentDTO> getAssignmentsByStudentCourseUnit(UserId studentId, CourseId courseId, UnitId unitId);
    List<AssignmentDTO> getAssignmentByCourseAndUnit(CourseId courseId, UnitId unitId);

    List<AssignmentDTO> getAssignmentsForStudentWeek(UserId studentId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<AssignmentDTO> getAssignmentsForTeacherWeek(UserId teacherId, LocalDateTime weekStart, LocalDateTime weekEnd);
    List<AssignmentDTO> getAssignmentsForStudentMonth(UserId studentId, LocalDateTime monthStart, LocalDateTime monthEnd);
    List<AssignmentDTO> getAssignmentsForTeacherMonth(UserId teacherId, LocalDateTime monthStart, LocalDateTime monthEnd);
}