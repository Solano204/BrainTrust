package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.PageService;
import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.exceptions.PageNotFoundException;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// other imports...

@Service
@Transactional
public class PageApplicationService implements PageService {

    private static final Logger log =
            LoggerFactory.getLogger(PageApplicationService.class);

    private final PageRepository pageRepository;
    private final DocumentStorageService documentStorageService;
    private final Semaphore storageRateLimiter = new Semaphore(20);


    public PageApplicationService(PageRepository pageRepository, DocumentStorageService documentStorageService) {
        this.pageRepository = pageRepository;
        this.documentStorageService = documentStorageService;
    }


    @Override
    public void addBulkAttachmentsJson(PageId pageId, List<FrontendDocumentDTO> attachments) {
        log.info("📎 Adding {} attachments via JSON to Page ID: {}",
                attachments != null ? attachments.size() : 0, pageId.getValue());

        try {
            Page page = findPageByIdOrThrow(pageId);

            if (attachments != null && !attachments.isEmpty()) {
                int processedCount = processFrontendDocuments(page, attachments);
                pageRepository.save(page);

                log.info("✅ {} attachments added via JSON to Page {}",
                        processedCount, pageId.getValue());
            }

        } catch (Exception e) {
            log.error("❌ Failed to add bulk attachments via JSON to Page {}: {}",
                    pageId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void addSingleAttachmentJson(PageId pageId, FrontendDocumentDTO attachment) {
        log.info("📎 Adding single attachment via JSON to Page ID: {}", pageId.getValue());

        try {
            if (attachment == null) {
                throw new IllegalArgumentException("Attachment cannot be null");
            }

            Page page = findPageByIdOrThrow(pageId);
            int processedCount = processFrontendDocuments(page, List.of(attachment));
            pageRepository.save(page);

            if (processedCount > 0) {
                log.info("✅ Single attachment added via JSON to Page {}",
                        pageId.getValue());
            }

        } catch (Exception e) {
            log.error("❌ Failed to add single attachment via JSON to Page {}: {}",
                    pageId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PageDTO createPageFrontend(CreatePageFrontendDTO command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating page with frontend extraction: '{}' for course {} and unit {}",
                command.title(), courseId.getValue(), unitId.getValue());

        try {
            // ✅ DIAGNOSTIC: Log input
            log.info("📋 Frontend extraction - Attachments: {}, Links: {}, Publish: {}",
                    command.attachments() != null ? command.attachments().size() : 0,
                    command.externalLinks() != null ? command.externalLinks().size() : 0,
                    command.publishImmediately());

            // ✅ PHASE 1: Create the page with basic information
            Page page = Page.create(courseId, unitId, command.title(), command.content());

            int filesProcessed = 0;
            int linksAdded = 0;

            // ✅ PHASE 2: Process frontend-extracted documents
            if (command.attachments() != null && !command.attachments().isEmpty()) {
                filesProcessed = processFrontendDocuments(page, command.attachments());
                log.debug("Processed {} frontend documents", filesProcessed);
            }

            // ✅ PHASE 3: Add external links
            if (command.externalLinks() != null && !command.externalLinks().isEmpty()) {
                linksAdded = addExternalLinksToPage(page, command.externalLinks());
                log.debug("Added {} external links", linksAdded);
            }

            // ✅ PHASE 4: Publish immediately if requested
            if (command.publishImmediately()) {
                page.publish();
                log.debug("Page set to published status");
            }

            // ✅ PHASE 5: Save the page
            Page savedPage = pageRepository.save(page);

            // ✅ PHASE 6: Build and return DTO
            PageDTO result = mapToCompleteDTO(savedPage);

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Frontend extraction page created in {}ms. Page ID: {}, Published: {}, Files: {}, Links: {}",
                    duration, savedPage.getId().getValue(), savedPage.isPublished(),
                    filesProcessed, linksAdded);

            return result;

        } catch (Exception e) {
            log.error("❌ Failed to create page with frontend extraction '{}': {}",
                    command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create page with frontend extraction", e);
        }
    }


    @Override
    public void updatePage(UpdatePageCommand command) {
        PageId pageId = PageId.fromString(command.pageId());
        log.info("Updating page {} with title: '{}'", pageId.getValue(), command.title());

        Page page = findPageByIdOrThrow(pageId);

        // Update both title and content
        page.updateTitleAndContent(command.title(), command.content());
        pageRepository.save(page);

        log.info("Page updated successfully: ID={}, Title='{}'", pageId.getValue(), command.title());
    }


    @Override
    public void addLinkToPage(PageId pageId, String linkUrl) {
        log.info("Adding link to Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        page.addLink(linkUrl);
        pageRepository.save(page);

        log.info("Link added successfully to Page ID: {}", pageId.getValue());
    }

    @Override
    public void removeLinkFromPage(PageId pageId, String linkUrl) {
        log.info("Removing link from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        // DON'T DO THIS - This causes UnsupportedOperationException
        // page.getExternalLinks().clear();

        // Instead, do this:
        List<String> updatedLinks = page.getExternalLinks().stream()
                .filter(link -> !link.equals(linkUrl))
                .collect(Collectors.toList());

        // Since we can't modify the immutable list directly, we need to recreate the page
        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()), // Keep existing attachments
                updatedLinks, // Use filtered links
                page.getCreatedAt(),
                LocalDateTime.now(), // Update timestamp
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("Link removed successfully from Page ID: {}", pageId.getValue());
    }


    @Override
    public void removeLinksFromPage(PageId pageId, List<String> links) {
        if (links == null || links.isEmpty()) {
            log.warn("Attempted to remove empty or null links list from page {}", pageId.getValue());
            return;
        }

        log.info("Removing {} links from Page ID: {}", links.size(), pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        List<String> currentLinks = new ArrayList<>(page.getExternalLinks());
        currentLinks.removeAll(links);

        // Recreate page with filtered links
        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()),
                currentLinks,
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("Successfully removed {} links from Page ID: {}", links.size(), pageId.getValue());
    }

    // Fix clearLinksFromPage
    @Override
    public void clearLinksFromPage(PageId pageId) {
        log.info("Clearing all links from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        // Recreate page with empty links list
        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()),
                new ArrayList<>(), // Empty links list
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("All links cleared from Page ID: {}", pageId.getValue());
    }

    // Fix clearAttachmentsFromPage
    @Override
    public void clearAttachmentsFromPage(PageId pageId) {
        log.info("Clearing all attachments from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        // Recreate page with empty attachments list
        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(), // Empty attachments list
                new ArrayList<>(page.getExternalLinks()),
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("All attachments cleared from Page ID: {}", pageId.getValue());
    }




    // ------------------------------------------------------------------
    // ✅ ATTACHMENT MANAGEMENT METHODS
    // ------------------------------------------------------------------

    @Override
    public void addAttachmentToPage(PageId pageId, MultipartFile file) {
        log.info("Adding attachment to Page ID: {}", pageId.getValue());

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        Page page = findPageByIdOrThrow(pageId);

        String originalFilename = file.getOriginalFilename();
        String storagePath = generatePageDocumentStoragePath(pageId.getValue(), originalFilename);
        String documentName = generateDocumentName(originalFilename);

        Document document = new Document(documentName, storagePath);
        page.addAttachment(document);
        pageRepository.save(page);

        log.info("Attachment '{}' added successfully to Page ID: {}", documentName, pageId.getValue());
    }

    @Override
    public void removeAttachmentFromPage(PageId pageId, String documentName) {
        log.info("Removing attachment '{}' from Page ID: {}", documentName, pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        // Create a new list without the specified document
        List<Document> updatedAttachments = page.getAttachments().stream()
                .filter(doc -> !doc.getName().equals(documentName))
                .collect(Collectors.toList());

        // Create a new mutable list for updates
        List<Document> mutableAttachments = new ArrayList<>(updatedAttachments);

        // Clear the actual domain list and re-add (requires domain method)
        page.getAttachmentsInternal().clear(); // Need to add this method
        mutableAttachments.forEach(page::addAttachment);

        pageRepository.save(page);

        log.info("Attachment '{}' removed successfully from Page ID: {}", documentName, pageId.getValue());
    }

    @Override
    public void removeAttachmentsFromPage(PageId pageId, List<String> documentNames) {
        if (documentNames == null || documentNames.isEmpty()) {
            log.warn("Attempted to remove empty or null attachments list from page {}", pageId.getValue());
            return;
        }

        log.info("Removing {} attachments from Page ID: {}", documentNames.size(), pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        List<Document> updatedAttachments = page.getAttachments().stream()
                .filter(doc -> !documentNames.contains(doc.getName()))
                .collect(Collectors.toList());

        page.getAttachments().clear();
        updatedAttachments.forEach(page::addAttachment);
        pageRepository.save(page);

        log.info("Successfully removed {} attachments from Page ID: {}", documentNames.size(), pageId.getValue());
    }


    // ------------------------------------------------------------------
    // ✅ EXISTING METHODS (Updated to handle bulk operations better)
    // ------------------------------------------------------------------

    @Override
    public void addLinksToPage(String pageId, List<String> urls) {
        PageId pageIdObj = PageId.fromString(pageId);

        if (urls == null || urls.isEmpty()) {
            log.warn("Attempted to add empty or null URLs list to page {}", pageId);
            return;
        }

        log.info("Adding {} links to page {}", urls.size(), pageId);

        Page page = findPageByIdOrThrow(pageIdObj);
        urls.forEach(page::addLink);
        pageRepository.save(page);

        log.info("Added {} links to page {}", urls.size(), pageId);
    }

    @Override
    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments) {
        PageId pageIdObj = PageId.fromString(pageId);

        if (attachments == null || attachments.isEmpty()) {
            log.warn("Attempted to add empty or null attachments list to page {}", pageId);
            return;
        }

        log.info("Adding {} attachments to page {}", attachments.size(), pageId);

        Page page = findPageByIdOrThrow(pageIdObj);

        attachments.forEach(command -> {
            Document document = new Document(command.documentName(), command.storagePath());
            page.addAttachment(document);
        });

        pageRepository.save(page);

        log.info("Added {} attachments to page {}", attachments.size(), pageId);
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
        log.info("📋 DIAGNOSTIC - Command received:");
        log.info("  courseId: {}", command.courseId());
        log.info("  unitId: {}", command.unitId());
        log.info("  title: '{}'", command.title());
        log.info("  content: '{}'", command.content() != null ?
                (command.content().length() > 50 ? command.content().substring(0, 50) + "..." : command.content())
                : "null");
        log.info("  publishImmediately: {}", command.publishImmediately());

        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("🚀 Creating page dynamically: '{}' for course {} and unit {} - Links: {}, Files: {}, Publish: {}",
                command.title(), courseId.getValue(), unitId.getValue(),
                command.externalLinks() != null ? command.externalLinks().size() : 0,
                command.attachments() != null ? command.attachments().size() : 0,
                command.publishImmediately());

        try {
            // ✅ DIAGNOSTIC: Log before Page.create()
            log.info("📋 DIAGNOSTIC - Creating page with:");
            log.info("  courseId: {}", courseId.getValue());
            log.info("  unitId: {}", unitId.getValue());
            log.info("  title: '{}'", command.title());
            log.info("  content length: {}", command.content() != null ? command.content().length() : 0);

            // ✅ PHASE 1: Create the page with basic information
            Page page = Page.create(courseId, unitId, command.title(), command.content());

            // ✅ DIAGNOSTIC: Log after Page.create()
            log.info("📋 DIAGNOSTIC - Page created:");
            log.info("  pageId: {}", page.getId().getValue());
            log.info("  courseId: {}", page.getCourseId().getValue());
            log.info("  unitId: {}", page.getUnitId().getValue());
            log.info("  title: '{}'", page.getTitle());
            log.info("  content length: {}", page.getContent() != null ? page.getContent().length() : 0);

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


    private int processFrontendDocuments(Page page, List<FrontendDocumentDTO> frontendDocuments) {
        if (frontendDocuments == null || frontendDocuments.isEmpty()) {
            return 0;
        }

        log.info("📎 Processing {} frontend documents for page", frontendDocuments.size());

        try {
            // Store documents with extracted text
            List<DocumentMetadata> metadataList = storeFrontendDocumentsWithRateLimit(
                    page.getId().getValue(),
                    frontendDocuments
            );

            // Convert to domain Documents
            List<Document> documents = metadataList.stream()
                    .map(metadata -> new Document(
                            metadata.getOriginalFilename(),
                            metadata.getStoragePath()
                    ))
                    .collect(Collectors.toList());

            // Add to page
            documents.forEach(page::addAttachment);

            log.info("✅ Successfully processed {} frontend documents", documents.size());
            return documents.size();

        } catch (Exception e) {
            log.error("❌ Failed to process frontend documents: {}", e.getMessage(), e);
            throw new RuntimeException("Frontend document processing failed", e);
        }
    }

    // ========================================
    // ✅ HELPER METHOD: Store frontend documents
    // ========================================
    private List<DocumentMetadata> storeFrontendDocumentsWithRateLimit(
            String targetId,
            List<FrontendDocumentDTO> frontendDocuments) {

        try {
            storageRateLimiter.acquire();
            try {
                return documentStorageService.storeDocumentFromFrontend(targetId, frontendDocuments);
            } finally {
                storageRateLimiter.release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Document storage interrupted", e);
        }
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



    private Page findPageByIdOrThrow(PageId pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId.getValue()));
    }

    private String generateDocumentName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "document_" + UUID.randomUUID().toString().substring(0, 8);
        }

        String safeName = originalFilename.replaceAll(".*[/\\\\]", "");
        return safeName.length() > 100 ? safeName.substring(0, 100) : safeName;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return null;
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }


}