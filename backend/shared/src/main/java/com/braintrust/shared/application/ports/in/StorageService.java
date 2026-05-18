package com.braintrust.shared.application.ports.in;


import com.braintrust.shared.application.dtos.dtos.FileUploadDTO;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    FileUploadDTO uploadFile(MultipartFile file);

    FileUploadDTO uploadFile(MultipartFile file, String path);

    boolean deleteFile(String fileUrl);

    FileUploadDTO getFileInfo(String fileUrl);

    boolean isStorageAvailable();
}