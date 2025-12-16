package com.braintrust.shared.application.services.storage;

import com.braintrust.shared.application.dtos.dtos.FileUploadDTO;
import com.braintrust.shared.application.ports.in.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
public class MockStorageService implements StorageService {

    private static final String MOCK_BASE_URL = "https://picsum.photos/seed";
    private static final Logger log =
            LoggerFactory.getLogger(MockStorageService.class);
    @Override
    public FileUploadDTO uploadFile(MultipartFile file) {
        log.info("Mock: Uploading file: {}", file.getOriginalFilename());
        return uploadFile(file, "uploads");
    }

    @Override
    public FileUploadDTO uploadFile(MultipartFile file, String path) {
        try {
            // Simulate processing delay
            Thread.sleep(ThreadLocalRandom.current().nextInt(500, 1500));

            String originalFileName = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = generateUniqueFileName(fileExtension);
            String storagePath = path + "/" + uniqueFileName;

            // Generate mock URL
            String fileUrl = String.format("%s/%s/%d/%d",
                    MOCK_BASE_URL,
                    originalFileName,
                    ThreadLocalRandom.current().nextInt(300, 800),
                    ThreadLocalRandom.current().nextInt(200, 600));

            log.info("Mock: File uploaded successfully. URL: {}, Path: {}", fileUrl, storagePath);

            return new FileUploadDTO(
                    uniqueFileName,
                    originalFileName,
                    file.getContentType(),
                    file.getSize(),
                    fileUrl,
                    storagePath
            );

        } catch (Exception e) {
            log.error("Mock: Failed to upload file {}: {}", file.getOriginalFilename(), e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public boolean deleteFile(String fileUrl) {
        log.info("Mock: Deleting file: {}", fileUrl);

        try {
            Thread.sleep(300); // Simulate processing
            log.info("Mock: File deleted successfully: {}", fileUrl);
            return true;
        } catch (Exception e) {
            log.error("Mock: Failed to delete file {}: {}", fileUrl, e.getMessage());
            return false;
        }
    }

    @Override
    public FileUploadDTO getFileInfo(String fileUrl) {
        log.info("Mock: Getting file info: {}", fileUrl);

        try {
            Thread.sleep(200); // Simulate processing

            return new FileUploadDTO(
                    "mock-file.jpg",
                    "original-file.jpg",
                    "image/jpeg",
                    1024 * 1024, // 1MB
                    fileUrl,
                    "uploads/mock-file.jpg"
            );
        } catch (Exception e) {
            log.error("Mock: Failed to get file info {}: {}", fileUrl, e.getMessage());
            return null;
        }
    }

    @Override
    public boolean isStorageAvailable() {
        return true; // Mock storage is always available
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private String generateUniqueFileName(String extension) {
        String uuid = UUID.randomUUID().toString();
        if (extension != null && !extension.isEmpty()) {
            return uuid + "." + extension;
        }
        return uuid;
    }
}