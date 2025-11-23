package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.PageService;
import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.exceptions.PageNotFoundException;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Service
@Transactional
public class PageApplicationService implements PageService {

    private static final Logger log =
            LoggerFactory.getLogger(PageApplicationService.class);

    private final PageRepository pageRepository;

    public PageApplicationService(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    @Override
    public PageId createPage(CreatePageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Creating page '{}' for course {} and unit {}", command.title(), courseId.getValue(), unitId.getValue());

        Page page = Page.create(courseId, unitId, command.title(), command.content());
        Page saved = pageRepository.save(page);

        log.info("Page created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public void updateContent(UpdatePageContentCommand command) {
        PageId pageId = PageId.fromString(command.pageId());
        log.info("Updating content for page {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        page.updateContent(command.content());
        pageRepository.save(page);

        log.info("Page content updated");
    }

    @Override
    public void addLinksToPage(String pageId, List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            log.warn("Attempted to add empty or null URLs list to page {}", pageId);
            return;
        }

        log.debug("Adding {} links to page {}", urls.size(), pageId);

        Page page = findPageByIdOrThrow(PageId.fromString(pageId));

        urls.forEach(page::addLink);
        pageRepository.save(page);

        log.info("Added {} links to page {}", urls.size(), pageId);
    }

    @Override
    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            log.warn("Attempted to add empty or null attachments list to page {}", pageId);
            return;
        }

        log.debug("Adding {} attachments to page {}", attachments.size(), pageId);

        Page page = findPageByIdOrThrow(PageId.fromString(pageId));

        attachments.forEach(command -> {
            Document document = new Document(command.documentName(), command.storagePath());
            page.addAttachment(document);
        });

        pageRepository.save(page);

        log.info("Added {} attachments to page {}", attachments.size(), pageId);
    }

    /*
    @Override
    public void publishPage(PublishPageCommand command) {
        PageId pageId = PageId.fromString(command.pageId());
        log.info("Publishing page {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        page.publish();
        pageRepository.save(page);

        log.info("Page published");
    }
    */

    /*
    @Override
    public PageDTO createCompletePage(CreateCompletePageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating complete page '{}' for course {} and unit {}",
                command.title(), courseId.getValue(), unitId.getValue());

        try {
            // ✅ PHASE 1: Create the page with basic information
            Page page = Page.create(courseId, unitId, command.title(), command.content());

            // ✅ PHASE 2: Add external links if provided
            if (command.externalLinks() != null && !command.externalLinks().isEmpty()) {
                command.externalLinks().forEach(page::addLink);
                log.debug("Added {} external links to page", command.externalLinks().size());
            }

            // ✅ PHASE 3: Add attachments if provided
            if (command.attachments() != null && !command.attachments().isEmpty()) {
                command.attachments().forEach(attachment -> {
                    Document document = new Document(attachment.name(), attachment.storagePath());
                    page.addAttachment(document);
                });
                log.debug("Added {} attachments to page", command.attachments().size());
            }

            // ✅ PHASE 4: Publish immediately if requested
            if (command.publishImmediately()) {
                page.publish();
                log.debug("Page set to published status");
            }

            // ✅ PHASE 5: Save the complete page
            Page savedPage = pageRepository.save(page);

            // ✅ PHASE 6: Build and return complete DTO
            PageDTO result = mapToCompleteDTO(savedPage);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Complete page created in {}ms. Page ID: {}, Published: {}",
                    duration, savedPage.getId().getValue(), savedPage.isPublished());

            return result;

        } catch (Exception e) {
            log.error("❌ Failed to create complete page '{}': {}",
                    command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create complete page", e);
        }
    }
    */

    @Override
    @Transactional(readOnly = true)
    public PageDTO getPageById(PageId pageId) {
        Page page = findPageByIdOrThrow(pageId);
        return mapToDTO(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPagesByCourse(CourseId courseId) {
        return pageRepository.findByCourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPagesByUnit(UnitId unitId) {
        return pageRepository.findByUnitId(unitId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPublishedPagesByCourse(CourseId courseId) {
        return pageRepository.findPublishedByCourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePage(PageId pageId) {
        log.info("Deleting page: {}", pageId.getValue());
        Page page = findPageByIdOrThrow(pageId);
        pageRepository.delete(page);
        log.info("Page deleted successfully: {}", pageId.getValue());
    }

    private Page findPageByIdOrThrow(PageId pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId.getValue()));
    }

    private PageDTO mapToDTO(Page page) {
        List<DocumentDTO> attachments = page.getAttachments().stream()
                .map(doc -> new DocumentDTO(doc.getName(), doc.getStoragePath()))
                .collect(Collectors.toList());

        return new PageDTO(
                page.getId().getValue(),
                page.getCourseId().getValue(),
                page.getUnitId().getValue(),
                "Course Name",
                "Unit Name",
                page.getTitle(),
                page.getContent(),
                attachments,
                page.getExternalLinks(),
                page.getCreatedAt().toString(),
                page.getLastModified().toString(),
                page.isPublished()
        );
    }

    @Override
    public PageDTO createPageWithFileAttachments(CreatePageWithAttachmentsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating page dynamically: '{}' for course {} and unit {} - Links: {}, Files: {}, Publish: {}",
                command.title(), courseId.getValue(), unitId.getValue(),
                command.externalLinks() != null ? command.externalLinks().size() : 0,
                command.attachments() != null ? command.attachments().size() : 0,
                command.publishImmediately());

        try {
            // ✅ PHASE 1: Create the page with basic information
            Page page = Page.create(courseId, unitId, command.title(), command.content());

            int linksAdded = 0;
            int filesProcessed = 0;

            // ✅ PHASE 2: Dynamically add external links if provided
            if (command.externalLinks() != null && !command.externalLinks().isEmpty()) {
                linksAdded = addExternalLinksToPage(page, command.externalLinks());
                log.debug("Dynamically added {} external links to page", linksAdded);
            } else {
                log.debug("No external links provided - skipping link addition");
            }

            // ✅ PHASE 3: Dynamically process file attachments if provided
            if (command.attachments() != null && !command.attachments().isEmpty()) {
                filesProcessed = processFileAttachments(page, command.attachments());
                log.debug("Dynamically processed {} file attachments", filesProcessed);
            } else {
                log.debug("No file attachments provided - skipping file processing");
            }

            // ✅ PHASE 4: Publish immediately if requested
            if (command.publishImmediately()) {
                page.publish();
                log.debug("Page set to published status");
            }

            // ✅ PHASE 5: Save the complete page
            Page savedPage = pageRepository.save(page);

            // ✅ PHASE 6: Build and return complete DTO
            PageDTO result = mapToCompleteDTO(savedPage);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Dynamic page creation completed in {}ms. Page ID: {}, Published: {}, Links: {}, Files: {}",
                    duration, savedPage.getId().getValue(), savedPage.isPublished(),
                    linksAdded, filesProcessed);

            return result;

        } catch (Exception e) {
            log.error("❌ Failed to create page dynamically '{}': {}",
                    command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create page with dynamic content", e);
        }
    }

    /**
     * ✅ Dynamically add external links to page
     * Returns the number of links successfully added
     */
    private int addExternalLinksToPage(Page page, List<String> externalLinks) {
        if (externalLinks == null || externalLinks.isEmpty()) {
            return 0;
        }

        int validLinksAdded = 0;

        for (String link : externalLinks) {
            try {
                if (link != null && !link.trim().isEmpty()) {
                    page.addLink(link.trim());
                    validLinksAdded++;
                    log.debug("Added external link: {}", link);
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to add external link '{}': {}", link, e.getMessage());
            }
        }

        return validLinksAdded;
    }

    /**
     * ✅ Dynamically process file attachments
     * Returns the number of files successfully processed
     */
    private int processFileAttachments(Page page, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return 0;
        }

        log.info("📎 Dynamically processing {} file attachments for page", attachments.size());

        int successfulUploads = 0;
        int failedUploads = 0;

        for (MultipartFile file : attachments) {
            try {
                // ✅ Skip null files or empty files
                if (file == null || file.isEmpty()) {
                    log.warn("⚠️ Skipping null or empty file");
                    failedUploads++;
                    continue;
                }

                // ✅ Mock file size check
                if (file.getSize() > 50 * 1024 * 1024) { // 50MB limit
                    log.warn("⚠️ File too large: {} ({} bytes)",
                            file.getOriginalFilename(), file.getSize());
                    failedUploads++;
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();
                long fileSize = file.getSize();

                // ✅ Generate storage path
                String storagePath = generatePageDocumentStoragePath(page.getId().getValue(), originalFilename);

                // ✅ Generate document name
                String documentName = generateDocumentName(originalFilename);

                // ✅ Create domain document
                Document document = new Document(documentName, storagePath);
                page.addAttachment(document);

                log.debug("✅ Dynamically added document: '{}' (Type: {}, Size: {} bytes)",
                        documentName, contentType, fileSize);

                successfulUploads++;

            } catch (Exception e) {
                log.error("❌ Failed to process file '{}': {}",
                        file != null ? file.getOriginalFilename() : "null", e.getMessage());
                failedUploads++;
            }
        }

        log.info("📊 Dynamic file processing summary: {} successful, {} failed out of {} total files",
                successfulUploads, failedUploads, attachments.size());

        return successfulUploads;
    }

    /**
     * ✅ Generate document name from original filename
     */
    private String generateDocumentName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "document_" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Remove path traversal and sanitize filename
        String safeName = originalFilename.replaceAll(".*[/\\\\]", "");
        return safeName.length() > 100 ? safeName.substring(0, 100) : safeName;
    }

    /**
     * ✅ Extract file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return null;
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * ✅ Generate storage path for page documents
     * Format: /pages/{pageId}/documents/{uniqueId}.{extension}
     */
    private String generatePageDocumentStoragePath(String pageId, String originalFilename) {
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFileId = UUID.randomUUID().toString();

        // Format: /pages/{pageId}/documents/{uniqueId}.{extension}
        String storagePath = String.format("/pages/%s/documents/%s", pageId, uniqueFileId);

        // Add file extension if available
        if (fileExtension != null && !fileExtension.isEmpty()) {
            storagePath += "." + fileExtension;
        }

        log.debug("Generated storage path: {} for file: {}", storagePath, originalFilename);
        return storagePath;
    }

    /**
     * ✅ Enhanced mapping to include all page attributes
     */
    private PageDTO mapToCompleteDTO(Page page) {
        List<DocumentDTO> attachments = page.getAttachments().stream()
                .map(doc -> new DocumentDTO(doc.getName(), doc.getStoragePath()))
                .collect(Collectors.toList());

        return new PageDTO(
                page.getId().getValue(),
                page.getCourseId().getValue(),
                page.getUnitId().getValue(),
                "Course Name", // TODO: Resolve from CourseService
                "Unit Name",   // TODO: Resolve from UnitService
                page.getTitle(),
                page.getContent(),
                attachments,
                page.getExternalLinks(),
                page.getCreatedAt().toString(),
                page.getLastModified().toString(),
                page.isPublished()
        );
    }

    /**
     * ✅ Calculate content size for analytics
     */
    private int calculateContentSize(String content) {
        return content != null ? content.length() : 0;
    }
}