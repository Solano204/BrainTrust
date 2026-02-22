package com.braintrust.containerapp.rest.storage;

import com.braintrust.education.application.service.PageApplicationService;
import com.braintrust.shared.application.dtos.dtos.FileUploadDTO;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import com.braintrust.shared.application.ports.in.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/storage")
@CrossOrigin(origins = "*")
@Slf4j

public class StorageController {


    private static final Logger log =
            LoggerFactory.getLogger(StorageController.class);

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "path", required = false, defaultValue = "uploads") String path) {

        log.info("Uploading file: {} (size: {} bytes, type: {})",
                file.getOriginalFilename(), file.getSize(), file.getContentType());

        try {
            FileUploadDTO uploadResult = storageService.uploadFile(file, path);

            Map<String, Object> data = new HashMap<>();
            data.put("url", uploadResult.url());
            data.put("fileName", uploadResult.fileName());
            data.put("originalFileName", uploadResult.originalFileName());
            data.put("fileType", uploadResult.fileType());
            data.put("fileSize", uploadResult.fileSize());
            data.put("storagePath", uploadResult.storagePath());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new SuccessResponseDTO(true, "File uploaded successfully", data));

        } catch (Exception e) {
            log.error("Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SuccessResponseDTO(false, "Failed to upload file: " + e.getMessage(), null));
        }
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "path", required = false, defaultValue = "uploads") String path) {

        log.info("Uploading {} files", files.length);

        Map<String, Object> uploadResults = new HashMap<>();

        for (MultipartFile file : files) {
            try {
                FileUploadDTO uploadResult = storageService.uploadFile(file, path);
                uploadResults.put(file.getOriginalFilename(), uploadResult.url());
            } catch (Exception e) {
                log.error("Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage());
                uploadResults.put(file.getOriginalFilename(), "Failed: " + e.getMessage());
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Files uploaded successfully", uploadResults));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<SuccessResponseDTO> deleteFile(@RequestParam("url") String fileUrl) {
        log.info("Deleting file: {}", fileUrl);

        try {
            boolean deleted = storageService.deleteFile(fileUrl);

            if (deleted) {
                return ResponseEntity.ok(new SuccessResponseDTO(true, "File deleted successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new SuccessResponseDTO(false, "File not found or could not be deleted", null));
            }

        } catch (Exception e) {
            log.error("Failed to delete file {}: {}", fileUrl, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SuccessResponseDTO(false, "Failed to delete file: " + e.getMessage(), null));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<SuccessResponseDTO> checkStorageHealth() {
        log.debug("Checking storage health");

        try {
            boolean isAvailable = storageService.isStorageAvailable();

            Map<String, Object> healthInfo = new HashMap<>();
            healthInfo.put("available", isAvailable);
            healthInfo.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(new SuccessResponseDTO(true,
                    isAvailable ? "Storage is available" : "Storage is not available",
                    healthInfo));

        } catch (Exception e) {
            log.error("Storage health check failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SuccessResponseDTO(false, "Storage health check failed", null));
        }
    }

    @GetMapping("/info")
    public ResponseEntity<SuccessResponseDTO> getFileInfo(@RequestParam("url") String fileUrl) {
        log.debug("Getting file info: {}", fileUrl);

        try {
            FileUploadDTO fileInfo = storageService.getFileInfo(fileUrl);

            if (fileInfo != null) {
                Map<String, Object> info = new HashMap<>();
                info.put("fileName", fileInfo.fileName());
                info.put("originalFileName", fileInfo.originalFileName());
                info.put("fileType", fileInfo.fileType());
                info.put("fileSize", fileInfo.fileSize());
                info.put("url", fileInfo.url());
                info.put("storagePath", fileInfo.storagePath());

                return ResponseEntity.ok(new SuccessResponseDTO(true, "File information retrieved", info));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new SuccessResponseDTO(false, "File not found", null));
            }

        } catch (Exception e) {
            log.error("Failed to get file info {}: {}", fileUrl, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SuccessResponseDTO(false, "Failed to get file information", null));
        }
    }
}