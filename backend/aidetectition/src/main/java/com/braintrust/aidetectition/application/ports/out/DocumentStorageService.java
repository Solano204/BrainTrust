package com.braintrust.aidetectition.application.ports.out;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentStorageService {

    List<DocumentMetadata> storeDocument(String targetId, List<MultipartFile> files);

    List<DocumentMetadata> storeDocumentFromFrontend(String targetId,
                                                     List<FrontendDocumentDTO> frontendDocuments);

    List<DocumentMetadata> storeDocumentFromFrontendSub(String targetId,
                                                     List<FrontendDocumentDTOSub> frontendDocuments);

    List<DocumentMetadata> storeDocumentHybrid(String targetId,
                                               List<MultipartFile> files,
                                               List<String> extractedTexts);


    boolean deleteDocument(SubmissionId submissionId);
}