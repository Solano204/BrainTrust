package com.braintrust.aidetectition.application.ports.out;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
public interface DocumentStorageService {


    List< DocumentMetadata> storeDocument(String targetId, List<MultipartFile> file);


    boolean deleteDocument(SubmissionId submissionId);
}