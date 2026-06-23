package com.braintrust.education.application.helpers.assignment;

import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AssignmentLinkHelper {

    private static final Logger log = LoggerFactory.getLogger(AssignmentLinkHelper.class);

    private final AssignmentRepository assignmentRepository;

    public AssignmentLinkHelper(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    public void addLink(AssignmentId assignmentId, String link) {
        log.info("Adding link to Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.addLink(link);
        assignmentRepository.save(assignment);
        log.info("Link added to Assignment {}", assignmentId.getValue());
    }

    public void addLinks(AssignmentId assignmentId, List<String> links) {
        log.info("Adding {} links to Assignment ID: {}",
                links != null ? links.size() : 0, assignmentId.getValue());
        if (links == null || links.isEmpty()) return;
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.addLinks(links);
        assignmentRepository.save(assignment);
        log.info("{} links added to Assignment {}", links.size(), assignmentId.getValue());
    }

    public void removeLink(AssignmentId assignmentId, String link) {
        log.info("Removing link '{}' from Assignment ID: {}", link, assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.removeLink(link);
        assignmentRepository.save(assignment);
        log.info("Link removed from Assignment {}", assignmentId.getValue());
    }

    public void clearLinks(AssignmentId assignmentId) {
        log.info("Clearing all links for Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.clearLinks();
        assignmentRepository.save(assignment);
        log.info("All links cleared for Assignment {}", assignmentId.getValue());
    }

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("Assignment not found with ID: {}", assignmentId.getValue());
                    return new AssignmentNotFoundException(
                            "Assignment not found: " + assignmentId.getValue());
                });
    }
}