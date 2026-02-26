package com.braintrust.education.application.helpers.assignment;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.domain.exceptions.AssignmentNotFoundException;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Component
public class AssignmentAttachmentHelper {

    private static final Logger log = LoggerFactory.getLogger(AssignmentAttachmentHelper.class);

    private final AssignmentRepository assignmentRepository;
    private final DocumentStorageHelper documentStorageHelper;

    public AssignmentAttachmentHelper(
            AssignmentRepository assignmentRepository,
            DocumentStorageHelper documentStorageHelper) {
        this.assignmentRepository = assignmentRepository;
        this.documentStorageHelper = documentStorageHelper;
    }

    public void addAttachment(AssignmentId assignmentId, MultipartFile file) {
        log.info("📎 Adding single attachment to Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        List<DocumentMetadata> metadataList = documentStorageHelper.storeDocumentsWithRateLimit(
                assignmentId.getValue(), List.of(file));
        if (!metadataList.isEmpty()) {
            DocumentMetadata metadata = metadataList.get(0);
            assignment.addAttachment(new Document(metadata.getOriginalFilename(), metadata.getStoragePath()));
            assignmentRepository.save(assignment);
            log.info("✅ Attachment added to Assignment {}", assignmentId.getValue());
        }
    }

    public void addMultipleAttachments(AssignmentId assignmentId, List<MultipartFile> files) {
        log.info("📎 Adding {} attachments to Assignment ID: {}",
                files != null ? files.size() : 0, assignmentId.getValue());
        if (files == null || files.isEmpty()) return;
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        List<DocumentMetadata> metadataList = documentStorageHelper.storeDocumentsWithRateLimit(
                assignmentId.getValue(), files);
        List<Document> documents = documentStorageHelper.convertToDocuments(metadataList);
        assignment.addAttachments(documents);
        assignmentRepository.save(assignment);
        log.info("✅ {} attachments added to Assignment {}", documents.size(), assignmentId.getValue());
    }

    public void addBulkAttachmentsJson(AssignmentId assignmentId, List<FrontendDocumentDTO> attachments) {
        log.info("📎 Adding {} attachments via JSON to Assignment ID: {}",
                attachments != null ? attachments.size() : 0, assignmentId.getValue());
        if (attachments == null || attachments.isEmpty()) return;
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        List<DocumentMetadata> metadataList = documentStorageHelper.storeFrontendDocumentsWithRateLimit(
                assignmentId.getValue(), attachments);
        List<Document> documents = documentStorageHelper.convertToDocuments(metadataList);
        assignment.addAttachments(documents);
        assignmentRepository.save(assignment);
        log.info("✅ {} attachments added via JSON to Assignment {}", documents.size(), assignmentId.getValue());
    }

    public void addSingleAttachmentJson(AssignmentId assignmentId, FrontendDocumentDTO attachment) {
        log.info("📎 Adding single attachment via JSON to Assignment ID: {}", assignmentId.getValue());
        if (attachment == null) throw new IllegalArgumentException("Attachment cannot be null");
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        List<DocumentMetadata> metadataList = documentStorageHelper.storeFrontendDocumentsWithRateLimit(
                assignmentId.getValue(), List.of(attachment));
        if (!metadataList.isEmpty()) {
            DocumentMetadata metadata = metadataList.get(0);
            assignment.addAttachment(new Document(metadata.getOriginalFilename(), metadata.getStoragePath()));
            assignmentRepository.save(assignment);
            log.info("✅ Single attachment added via JSON to Assignment {}", assignmentId.getValue());
        }
    }

    /**
     * Removes by name. Uses the domain's removeAttachmentByName which does
     * a name-based lookup — no equality mismatch issues.
     */
    public void removeAttachment(AssignmentId assignmentId, String documentName) {
        log.info("📎 Removing attachment '{}' from Assignment ID: {}", documentName, assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        // Use name-based removal — avoids storagePath equality issues
        assignment.removeAttachmentByName(documentName);
        assignmentRepository.save(assignment);
        log.info("✅ Attachment '{}' removed from Assignment {}", documentName, assignmentId.getValue());
    }

    public void removeAttachmentByDocument(AssignmentId assignmentId, Document document) {
        log.warn("🗑️ Removing attachment from Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.removeAttachment(document);
        assignmentRepository.save(assignment);
        log.info("✅ Attachment removed from Assignment {}", assignmentId.getValue());
    }

    public void clearAttachments(AssignmentId assignmentId) {
        log.warn("🗑️ Clearing all attachments for Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.clearAttachments();
        assignmentRepository.save(assignment);
        log.info("✅ All attachments cleared for Assignment {}", assignmentId.getValue());
    }

    public void addAttachmentByDocument(AssignmentId assignmentId, Document document) {
        log.info("📎 Adding attachment to Assignment ID: {}", assignmentId.getValue());
        Assignment assignment = findAssignmentByIdOrThrow(assignmentId);
        assignment.addAttachment(document);
        assignmentRepository.save(assignment);
        log.info("✅ Attachment added to Assignment {}", assignmentId.getValue());
    }

    private Assignment findAssignmentByIdOrThrow(AssignmentId assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> {
                    log.warn("❌ Assignment not found with ID: {}", assignmentId.getValue());
                    return new AssignmentNotFoundException(
                            "Assignment not found: " + assignmentId.getValue());
                });
    }
}