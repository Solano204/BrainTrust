package com.braintrust.education.application.mappers;

import com.braintrust.education.application.dtos.dtos.AssignmentDTO;
import com.braintrust.education.application.dtos.dtos.DocumentDTO;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.Document;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssignmentDtoMapper {

    public AssignmentDTO toDTO(Assignment assignment) {
        return toDTOWithStudentStatus(assignment, null);
    }

    public AssignmentDTO toDTOWithStudentStatus(Assignment assignment, String studentSubmissionStatus) {
        List<DocumentDTO> attachmentDTOs = assignment.getAttachments().stream()
                .map(doc -> new DocumentDTO(
                        doc.getName(),
                        doc.getStoragePath()
                ))
                .collect(Collectors.toList());

        String targetType = assignment.getTargetType().name();
        boolean isTeamAssignment = assignment.isTeamAssignment();
        String submissionFormat = assignment.getSubmissionFormat().name();

        return new AssignmentDTO(
                assignment.getId().getValue(),
                assignment.getCourseId().getValue(),
                assignment.getUnitId().getValue(),
                "Course Name",
                "Unit Name",
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getCreatedAt().toString(),
                assignment.getDueDate() != null ? assignment.getDueDate().toString() : null,
                assignment.getMaxScore().getMaxPoints(),
                assignment.getInstructions(),
                assignment.isActive(),
                assignment.getSubmissions().size(),
                assignment.getAttachmentCount(),
                assignment.canAcceptSubmissions(),
                targetType,
                isTeamAssignment,
                submissionFormat,
                attachmentDTOs,
                assignment.getLinks(),
                studentSubmissionStatus
        );
    }

    public List<AssignmentDTO> toDTOList(List<Assignment> assignments) {
        return assignments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}