package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Local filesystem implementation of document storage
 * Use for development and small deployments
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
@Primary
public class LocalFileStorageService implements DocumentStorageService {

    private static final Logger log =
            LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${document.storage.local.base-path:./storage/documents}")
    private String baseStoragePath;

    @Override
    public List<DocumentMetadata> storeDocument(String targetId, List<MultipartFile> files) {
        log.info("📁 Starting storage for {} documents associated with Submission ID: {}",
                files.size(), targetId);

        List<DocumentMetadata> results = new ArrayList<>();

        try {
            Path storageDir = Paths.get(baseStoragePath);
            Files.createDirectories(storageDir);

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    log.warn("Skipping empty file received for submission {}", targetId);
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                String uniqueIdentifier = UUID.randomUUID().toString();
                String filename = targetId + "_" + uniqueIdentifier + "_" + sanitizeFilename(originalFilename);
                Path filePath = storageDir.resolve(filename);

                String checksum;
                try (InputStream inputStream = file.getInputStream()) {
                    checksum = calculateChecksum(inputStream);
                }

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                DocumentMetadata metadata = new DocumentMetadata(
                        originalFilename,
                        filePath.toString(),
                        LocalDateTime.now()
                );
                results.add(metadata);

                log.info("✅ Stored file '{}'. Path: {}", originalFilename, filePath);
            }

        } catch (Exception e) {
            log.error("❌ Failed to store documents for submission: {}.", targetId, e);

            results.forEach(m -> {
                try {
                    Files.deleteIfExists(Paths.get(m.getStoragePath()));
                } catch (IOException ioE) {
                    log.warn("Failed cleanup of partially stored file: {}", m.getStoragePath());
                }
            });
            throw new RuntimeException("Failed to store one or more documents: " + e.getMessage(), e);
        }

        return results;
    }

    @Override
    public List<DocumentMetadata> storeDocumentFromFrontend(String targetId,
                                                            List<FrontendDocumentDTO> frontendDocuments) {
        List<DocumentMetadata> results = new ArrayList<>();

        try {
            Path storageDir = Paths.get(baseStoragePath);
            Files.createDirectories(storageDir);

            for (FrontendDocumentDTO frontendDoc : frontendDocuments) {

                String originalFilename = frontendDoc.originalFilename();
                String uniqueIdentifier = UUID.randomUUID().toString();

                String txtFilename = targetId + "_" + uniqueIdentifier + "_" +
                        sanitizeFilename(originalFilename) + "_extracted.txt";
                Path txtFilePath = storageDir.resolve(txtFilename);

                Files.writeString(txtFilePath, "");

                DocumentMetadata metadata = new DocumentMetadata(
                        originalFilename,
                        frontendDocuments.getFirst().uploadedUrl(),
                        LocalDateTime.now()
                );
                results.add(metadata);
            }

        } catch (Exception e) {
            results.forEach(m -> {
                try {
                    Files.deleteIfExists(Paths.get(m.getStoragePath()));
                } catch (IOException ioE) {

                }
            });
            throw new RuntimeException("Failed to store frontend documents: " + e.getMessage(), e);
        }

        return results;
    }

    @Override
    public List<DocumentMetadata> storeDocumentFromFrontendSub(String targetId,
                                                            List<FrontendDocumentDTOSub> frontendDocuments) {
        List<DocumentMetadata> results = new ArrayList<>();

        try {
            Path storageDir = Paths.get(baseStoragePath);
            Files.createDirectories(storageDir);

            for (FrontendDocumentDTOSub frontendDoc : frontendDocuments) {
                String originalFilename = frontendDoc.originalFilename();
                String uniqueIdentifier = UUID.randomUUID().toString();

                String txtFilename = targetId + "_" + uniqueIdentifier + "_" +
                        sanitizeFilename(originalFilename) + "_extracted.txt";
                Path txtFilePath = storageDir.resolve(txtFilename);

                Files.writeString(txtFilePath, "");

                DocumentMetadata metadata = new DocumentMetadata(
                        originalFilename,
                        frontendDocuments.getFirst().uploadedUrl(),
                        LocalDateTime.now()

                );
                results.add(metadata);
            }

        } catch (Exception e) {
            results.forEach(m -> {
                try {
                    Files.deleteIfExists(Paths.get(m.getStoragePath()));
                } catch (IOException ioE) {
                    // Log warning
                }
            });
            throw new RuntimeException("Failed to store frontend documents: " + e.getMessage(), e);
        }

        return results;
    }


    @Override
    public List<DocumentMetadata> storeDocumentHybrid(String targetId,
                                                      List<MultipartFile> files,
    List<String> extractedTexts) {
        List<DocumentMetadata> results = new ArrayList<>();

        try {
            Path storageDir = Paths.get(baseStoragePath);
            Files.createDirectories(storageDir);

            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                String extractedText = extractedTexts.get(i);

                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();
                String uniqueIdentifier = UUID.randomUUID().toString();
                String originalFilenameStored = targetId + "_" + uniqueIdentifier + "_" +
                        sanitizeFilename(originalFilename);
                Path originalFilePath = storageDir.resolve(originalFilenameStored);
                Files.copy(file.getInputStream(), originalFilePath, StandardCopyOption.REPLACE_EXISTING);

                String extractedTextPath = null;
                if (extractedText != null && !extractedText.trim().isEmpty()) {
                    String extractedFilename = originalFilenameStored + "_extracted.txt";
                    Path extractedFilePath = storageDir.resolve(extractedFilename);
                    Files.writeString(extractedFilePath, extractedText);
                    extractedTextPath = extractedFilePath.toString();
                }

                DocumentMetadata metadata = new DocumentMetadata(
                        originalFilename,
                        originalFilePath.toString(),
                        LocalDateTime.now()
                );
                results.add(metadata);
            }

        } catch (Exception e) {
            // Cleanup on failure
            results.forEach(m -> {
                try {
                    Files.deleteIfExists(Paths.get(m.getStoragePath()));
                } catch (IOException ioE) {
                    // Log warning
                }
            });
            throw new RuntimeException("Failed to store hybrid documents: " + e.getMessage(), e);
        }

        return results;
    }

    @Override
    public boolean deleteDocument(SubmissionId submissionId) {
        log.warn("🗑️ Deleting ALL documents associated with submission: {}", submissionId.getValue());

        try {
            Path storagePath = Paths.get(baseStoragePath);

            List<Path> filesToDelete = Files.list(storagePath)
                    .filter(path -> path.getFileName().toString().startsWith(submissionId.getValue() + "_"))
                    .collect(Collectors.toList());

            if (filesToDelete.isEmpty()) {
                log.warn("⚠️ No documents found for deletion for submission: {}", submissionId.getValue());
                return false;
            }

            for (Path filePath : filesToDelete) {
                Files.delete(filePath);
            }

            log.info("✅ Successfully deleted {} documents for submission ID {}.",
                    filesToDelete.size(), submissionId.getValue());
            return true;

        } catch (Exception e) {
            log.error("❌ Error deleting documents for submission: {}", submissionId.getValue(), e);
            return false;
        }
    }


    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return UUID.randomUUID().toString();
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String calculateChecksum(InputStream inputStream) {
        try {

            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }

            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (Exception e) {
            log.warn("Failed to calculate checksum: {}", e.getMessage());
            return "N/A_Checksum_Failed";
        }
    }
}