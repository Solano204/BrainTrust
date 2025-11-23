package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.application.ports.in.PageService;
import com.braintrust.education.domain.valueobjects.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
// other imports...

@RestController
@RequestMapping("/api/pages")
public class PageController {

    private static final Logger log =
            LoggerFactory.getLogger(PageController.class);
    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    /*
    @PostMapping("/complete")
    public ResponseEntity<PageDTO> createCompletePage(
            @RequestBody CreateCompletePageCommand command) {

        log.info("🎯 Creating complete page: '{}' for course {}",
                command.title(), command.courseId());

        PageDTO result = pageService.createCompletePage(command);

        log.info("✅ Complete page created successfully. Page ID: {}, Published: {}",
                result.id(), result.published());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    */

    /*
    @PostMapping("/bulk")
    public ResponseEntity<List<PageDTO>> createBulkPages(
            @RequestBody List<CreateCompletePageCommand> commands) {

        log.info("📚 Creating {} pages in bulk", commands.size());

        List<PageDTO> results = commands.stream()
                .map(pageService::createCompletePage)
                .collect(Collectors.toList());

        log.info("✅ Bulk page creation completed. Created {} pages", results.size());

        return ResponseEntity.status(HttpStatus.CREATED).body(results);
    }
    */

    @PutMapping("/{pageId}/content")
    public ResponseEntity<Void> updateContent(
            @PathVariable String pageId,
            @RequestBody UpdatePageContentCommand command) {
        pageService.updateContent(command);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{pageId}/links/bulk")
    public ResponseEntity<Void> addLinksToPage(
            @PathVariable String pageId,
            @RequestBody List<String> urls) {
        pageService.addLinksToPage(pageId, urls);
        return ResponseEntity.ok().build();
    }

    /*
    @PostMapping("/{pageId}/attachments/bulk")
    public ResponseEntity<Void> addAttachmentsToPage(
            @PathVariable String pageId,
            @RequestBody List<AddPageAttachmentCommand> attachments) {
        pageService.addAttachmentsToPage(pageId, attachments);
        return ResponseEntity.ok().build();
    }
    */

    /*
    @PutMapping("/{pageId}/publish")
    public ResponseEntity<Void> publishPage(@PathVariable String pageId) {
        pageService.publishPage(new PublishPageCommand(pageId));
        return ResponseEntity.ok().build();
    }
    */

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

    // NEW: Get page by specific unit
    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<PageDTO>> getPagesByUnit(@PathVariable String unitId) {
        List<PageDTO> pages = pageService.getPagesByUnit(UnitId.fromString(unitId));
        return ResponseEntity.ok(pages);
    }

    // NEW: Delete specific page
    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable String pageId) {
        pageService.deletePage(PageId.fromString(pageId));
        return ResponseEntity.noContent().build();
    }

    /**
     * NEW: Create page with dynamic content (links and/or files) - No validation
     */
    @PostMapping(value = "/dynamic-simple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> createPageDynamicSimple(
            @RequestParam("courseId") String courseId,
            @RequestParam("unitId") String unitId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "externalLinks", required = false) List<String> externalLinks,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments,
            @RequestParam(value = "publishImmediately", defaultValue = "false") boolean publishImmediately) {

        log.info("🔄 Simple dynamic page creation - Title: '{}', Course: {}, Unit: {}, Links: {}, Files: {}",
                title, courseId, unitId,
                externalLinks != null ? externalLinks.size() : 0,
                attachments != null ? attachments.size() : 0);

        try {
            // ✅ Manual validation
            if (courseId == null || courseId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Course ID is required");
            }
            if (unitId == null || unitId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Unit ID is required");
            }
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content is required");
            }

            // ✅ Create command
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

            log.info("✅ Page created successfully. ID: {}", result.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (Exception e) {
            log.error("❌ Failed to create page: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * NEW: Add file attachments to existing page
     */
    @PostMapping(value = "/{pageId}/attachments/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadAttachmentsToPage(
            @PathVariable String pageId,
            @RequestParam("files") List<MultipartFile> files) {

        log.info("📎 Uploading {} files to page {}", files.size(), pageId);

        try {
            // Convert MultipartFiles to AddPageAttachmentCommand with mock paths
            List<AddPageAttachmentCommand> attachmentCommands = files.stream()
                    .map(file -> {
                        String mockPath = "/uploads/pages/" + pageId + "/" +
                                System.currentTimeMillis() + "_" + file.getOriginalFilename();
                        return new AddPageAttachmentCommand(pageId, file.getOriginalFilename(), mockPath);
                    }).collect(Collectors.toList());
            pageService.addAttachmentsToPage(pageId, attachmentCommands);

            log.info("✅ Successfully uploaded {} files to page {}", files.size(), pageId);
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("❌ Failed to upload files to page {}: {}", pageId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}