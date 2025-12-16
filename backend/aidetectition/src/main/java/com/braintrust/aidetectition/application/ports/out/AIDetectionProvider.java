package com.braintrust.aidetectition.application.ports.out;

import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.ModelPerformance;

import java.math.BigDecimal;
import java.util.List;

// 📍 aidetection/application/ports/out/AIDetectionProvider.java
public interface AIDetectionProvider {

    /**
     * Analyze text content to detect AI-generated text
     */
    DetectionResult analyzeContent(String content, ModelType modelType);

    /**
     * Get available AI detection models
     */
    List<ModelType> getAvailableModels();

    /**
     * Get performance metrics for a specific model
     */
    ModelPerformance getModelPerformance(ModelType modelType);

    /**
     * Check if the AI service is available
     */
    boolean isServiceAvailable();

    /**
     * Get service health status (0.0 to 1.0)
     */
    BigDecimal getServiceHealth();
}