package com.braintrust.aidetectition.application.ports.out;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentStorageService {





    // ✅ OPTION 1: Backend extraction (original)
    List<DocumentMetadata> storeDocument(String targetId, List<MultipartFile> files);

    // ✅ OPTION 2: Frontend extraction (NEW - no file uploads)
    List<DocumentMetadata> storeDocumentFromFrontend(String targetId,
                                                     List<FrontendDocumentDTO> frontendDocuments);

    // ✅ OPTION 3: Frontend extraction Submission (NEW - no file uploads)
    List<DocumentMetadata> storeDocumentFromFrontendSub(String targetId,
                                                     List<FrontendDocumentDTOSub> frontendDocuments);

    // ✅ OPTION 3: Hybrid approach (files + frontend extracted text)
    List<DocumentMetadata> storeDocumentHybrid(String targetId,
                                               List<MultipartFile> files,
                                               List<String> extractedTexts);


    boolean deleteDocument(SubmissionId submissionId);
}