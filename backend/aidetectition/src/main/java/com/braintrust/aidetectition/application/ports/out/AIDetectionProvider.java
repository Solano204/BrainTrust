package com.braintrust.aidetectition.application.ports.out;

import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.ModelPerformance;

import java.math.BigDecimal;
import java.util.List;


public interface AIDetectionProvider {

    DetectionResult analyzeContent(String content, ModelType modelType);

    List<ModelType> getAvailableModels();

    ModelPerformance getModelPerformance(ModelType modelType);

    boolean isServiceAvailable();

    BigDecimal getServiceHealth();
}