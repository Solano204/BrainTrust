package com.braintrust.education.application.ports.in;


import com.braintrust.education.application.dtos.dtos.FileUploadDTO;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Upload a file and return its URL
     */
    FileUploadDTO uploadFile(MultipartFile file);

    /**
     * Upload a file with custom path
     */
    FileUploadDTO uploadFile(MultipartFile file, String path);

    /**
     * Delete a file by its URL or path
     */
    boolean deleteFile(String fileUrl);

    /**
     * Get file information
     */
    FileUploadDTO getFileInfo(String fileUrl);

    /**
     * Check if storage is available
     */
    boolean isStorageAvailable();
}