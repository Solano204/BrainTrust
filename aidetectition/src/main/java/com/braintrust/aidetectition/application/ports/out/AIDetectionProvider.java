package com.braintrust.aidetectition.application.ports.out;

import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.ModelPerformance;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

// 📍 aidetection/application/ports/out/AIDetectionProvider.java
public interface AIDetectionProvider {

    DetectionResult analyzeContent(String content, ModelType modelType);

    // ✅ NEW: Extract text from PDF file
    String extractTextFromPdf(MultipartFile pdfFile);

    // ✅ NEW: Analyze PDF file directly (extract + analyze)
    List<DetectionResult> analyzePdfFile( List<MultipartFile> pdfFile, ModelType modelType);

    List<ModelType> getAvailableModels();

    ModelPerformance getModelPerformance(ModelType modelType);

    boolean isServiceAvailable();

    BigDecimal getServiceHealth();
}