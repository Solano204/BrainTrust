package com.braintrust.containerapp.rest.course;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.application.ports.in.PageService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/pages")
public class PageController {

    private final PageService pageService;
    private static final Logger log = LoggerFactory.getLogger(PageController.class);

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @PostMapping(value = "/frontend", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PageDTO> createPageFrontend(
            @RequestBody CreatePageFrontendDTO command
    ) {
        log.info("Frontend extraction - Creating page '{}' for Course {} with {} frontend documents",
                command.title(), command.courseId(),
                command.attachments() != null ? command.attachments().size() : 0);

        try {
            PageDTO result = pageService.createPageFrontend(command);
            log.info("Page created with frontend extraction. ID: {}", result.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            log.error("Failed to create page with frontend extraction: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping("/{pageId}/links")
    public ResponseEntity<SuccessResponseDTO> addLink(
            @PathVariable String pageId,
            @Valid @RequestBody AddLinkCommand command
    ) {
        log.info("Request to add link to Page ID: {}", pageId);
        pageService.addLinkToPage(
                PageId.fromString(pageId),
                command.linkUrl()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Link added successfully", null)
        );
    }


    @PutMapping("/{pageId}")
    public ResponseEntity<PageDTO> updatePage(
            @PathVariable String pageId,
            @RequestBody UpdatePageCommand command) {

        if (!pageId.equals(pageId)) {
            throw new IllegalArgumentException("Page ID mismatch between path and request body");
        }

        pageService.updatePage(command);
        PageDTO updatedPage = pageService.getPageById(PageId.fromString(pageId));
        return ResponseEntity.ok(updatedPage);
    }

    @PostMapping(value = "/dynamic-simple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PageDTO> createPageDynamicSimple(
            @RequestParam("courseId") String courseId,
            @RequestParam("unitId") String unitId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "externalLinks", required = false) List<String> externalLinks,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments,
            @RequestParam(value = "publishImmediately", defaultValue = "false") boolean publishImmediately) {

        log.info("Simple dynamic page creation - Title: '{}', Course: {}, Unit: {}, Links: {}, Files: {}",
                title, courseId, unitId,
                externalLinks != null ? externalLinks.size() : 0,
                attachments != null ? attachments.size() : 0);

        try {
            if (courseId == null || courseId.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (unitId == null || unitId.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            CreatePageWithAttachmentsCommand command = new CreatePageWithAttachmentsCommand(
                    courseId.trim(),
                    unitId.trim(),
                    title.trim(),
                    content.trim(),
                    externalLinks != null ? externalLinks : List.of(),
                    attachments != null ? attachments : List.of(),
                    publishImmediately
            );

            PageDTO result = pageService.createPageWithFileAttachments(command);
            log.info("Page created successfully. ID: {}", result.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            log.error("Failed to create page: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    @PostMapping("/{pageId}/links/bulk")
    public ResponseEntity<SuccessResponseDTO> addMultipleLinks(
            @PathVariable String pageId,
            @Valid @RequestBody AddMultipleLinksCommand command
    ) {
        log.info("Request to add {} links to Page ID: {}",
                command.links().size(), pageId);
        pageService.addLinksToPage(
                pageId,
                command.links()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Links added successfully", null)
        );
    }

    @DeleteMapping("/{pageId}/links")
    public ResponseEntity<SuccessResponseDTO> removeLink(
            @PathVariable String pageId,
            @Valid @RequestBody RemoveLinkCommand command
    ) {
        log.info("Request to remove link from Page ID: {}", pageId);
        pageService.removeLinkFromPage(
                PageId.fromString(pageId),
                command.linkUrl()  // Changed from getLinkUrl() to linkUrl()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Link removed successfully", null)
        );
    }

    @DeleteMapping("/{pageId}/links/batch")
    public ResponseEntity<SuccessResponseDTO> removeMultipleLinks(
            @PathVariable String pageId,
            @Valid @RequestBody RemoveMultipleLinksCommand command
    ) {
        log.info("Request to remove {} links from Page ID: {}",
                command.links().size(), pageId);
        pageService.removeLinksFromPage(
                PageId.fromString(pageId),
                command.links()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Links removed successfully", null)
        );
    }

    @DeleteMapping("/{pageId}/links/all")
    public ResponseEntity<SuccessResponseDTO> clearLinks(@PathVariable String pageId) {
        log.info("Request to clear all links from Page ID: {}", pageId);
        pageService.clearLinksFromPage(PageId.fromString(pageId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "All links cleared successfully", null)
        );
    }

    @PostMapping(value = "/{pageId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> addAttachment(
            @PathVariable String pageId,
            @Valid @ModelAttribute AddAttachmentCommand command
    ) {
        log.info("Request to add attachment to Page ID: {}", pageId);
        pageService.addAttachmentToPage(
                PageId.fromString(pageId),
                command.file()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment added successfully", null)
        );
    }

    @PostMapping(value = "/{pageId}/attachments/bulk",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> addMultipleAttachments(
            @PathVariable String pageId,
            @Valid @ModelAttribute AddMultipleAttachmentsCommand command
    ) {
        log.info("Request to add {} attachments to Page ID: {}",
                command.files().size(), pageId);

        List<AddPageAttachmentCommand> attachmentCommands = command.files().stream()
                .map(file -> {
                    String storagePath = generateStoragePath(pageId, file);
                    return new AddPageAttachmentCommand(
                            pageId,
                            file.getOriginalFilename(),
                            storagePath
                    );
                })
                .collect(Collectors.toList());

        pageService.addAttachmentsToPage(
                pageId,
                attachmentCommands
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachments added successfully", null)
        );
    }

    private String generateStoragePath(String pageId, MultipartFile file) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalFilename = file.getOriginalFilename();
        String safeFilename = originalFilename != null ?
                originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_") :
                "file_" + timestamp;

        return String.format("/uploads/pages/%s/%s_%s",
                pageId, timestamp, safeFilename);
    }

    @PostMapping(value = "/{pageId}/attachments/bulk-json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SuccessResponseDTO> addBulkAttachmentsJson(
            @PathVariable String pageId,
            @Valid @RequestBody AddBulkAttachmentsJsonCommand command
    ) {
        log.info("Request to add {} attachments via JSON to Page ID: {}",
                command.attachments() != null ? command.attachments().size() : 0, pageId);

        pageService.addBulkAttachmentsJson(
                PageId.fromString(pageId),
                command.attachments()
        );

        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachments added successfully via JSON", null)
        );
    }

    @PostMapping(value = "/{pageId}/attachments/single-json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SuccessResponseDTO> addSingleAttachmentJson(
            @PathVariable String pageId,
            @Valid @RequestBody FrontendDocumentDTO attachment
    ) {
        log.info("Request to add single attachment via JSON to Page ID: {}", pageId);

        pageService.addSingleAttachmentJson(
                PageId.fromString(pageId),
                attachment
        );

        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment added successfully via JSON", null)
        );
    }

    @DeleteMapping("/{pageId}/attachments")
    public ResponseEntity<SuccessResponseDTO> removeAttachment(
            @PathVariable String pageId,
            @Valid @RequestBody RemoveAttachmentCommand command
    ) {
        log.info("Request to remove attachment from Page ID: {}", pageId);
        pageService.removeAttachmentFromPage(
                PageId.fromString(pageId),
                command.documentName()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachment removed successfully", null)
        );
    }

    @DeleteMapping("/{pageId}/attachments/batch")
    public ResponseEntity<SuccessResponseDTO> removeMultipleAttachments(
            @PathVariable String pageId,
            @Valid @RequestBody RemoveMultipleAttachmentsCommand command
    ) {
        log.info("Request to remove {} attachments from Page ID: {}",
                command.documentNames().size(), pageId);
        pageService.removeAttachmentsFromPage(
                PageId.fromString(pageId),
                command.documentNames()
        );
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Attachments removed successfully", null)
        );
    }

    @DeleteMapping("/{pageId}/attachments/all")
    public ResponseEntity<SuccessResponseDTO> clearAttachments(@PathVariable String pageId) {
        log.info("Request to clear all attachments from Page ID: {}", pageId);
        pageService.clearAttachmentsFromPage(PageId.fromString(pageId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "All attachments cleared successfully", null)
        );
    }


    @PutMapping("/{pageId}/content")
    public ResponseEntity<Void> updateContent(
            @PathVariable String pageId,
            @RequestBody UpdatePageContentCommand command) {
        pageService.updateContent(command);
        return ResponseEntity.ok().build();
    }



    @GetMapping("/{pageId}")
    public ResponseEntity<PageDTO> getPage(@PathVariable String pageId) {
        PageDTO dto = pageService.getPageById(PageId.fromString(pageId));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<PageDTO>> getPagesByCourse(@PathVariable String courseId) {
        List<PageDTO> pages = pageService.getPagesByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(pages);
    }

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<PageDTO>> getPagesByUnit(@PathVariable String unitId) {
        List<PageDTO> pages = pageService.getPagesByUnit(UnitId.fromString(unitId));
        return ResponseEntity.ok(pages);
    }

    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable String pageId) {
        pageService.deletePage(PageId.fromString(pageId));
        return ResponseEntity.noContent().build();
    }



    @PostMapping(value = "/{pageId}/attachments/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadAttachmentsToPage(
            @PathVariable String pageId,
            @RequestParam("files") List<MultipartFile> files) {

        log.info("Uploading {} files to page {}", files.size(), pageId);

        try {
            List<AddPageAttachmentCommand> attachmentCommands = files.stream()
                    .map(file -> {
                        String mockPath = "/uploads/pages/" + pageId + "/" +
                                System.currentTimeMillis() + "_" + file.getOriginalFilename();

                        return new AddPageAttachmentCommand(pageId, file.getOriginalFilename(), mockPath);
                    }).collect(Collectors.toList());

            pageService.addAttachmentsToPage(pageId, attachmentCommands);

            log.info("Successfully uploaded {} files to page {}", files.size(), pageId);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Failed to upload files to page {}: {}", pageId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}