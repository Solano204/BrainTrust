package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.domain.valueobjects.ModelType;

import java.math.BigDecimal;
import java.util.Objects;

public class ModelPerformance {
    private final ModelType modelType;
    private final String version;
    private final BigDecimal accuracy;
    private final BigDecimal precision;
    private final BigDecimal recall;
    private final BigDecimal f1Score;
    private final boolean isActive;

    public ModelPerformance(ModelType modelType, String version, BigDecimal accuracy,
                            BigDecimal precision, BigDecimal recall, BigDecimal f1Score,
                            boolean isActive) {
        this.modelType = Objects.requireNonNull(modelType, "Model type cannot be null");
        this.version = Objects.requireNonNull(version, "Version cannot be null");
        this.accuracy = validateMetric(accuracy, "Accuracy");
        this.precision = validateMetric(precision, "Precision");
        this.recall = validateMetric(recall, "Recall");
        this.f1Score = validateMetric(f1Score, "F1 Score");
        this.isActive = isActive;
    }

    private BigDecimal validateMetric(BigDecimal metric, String metricName) {
        if (metric == null) {
            throw new IllegalArgumentException(metricName + " cannot be null");
        }
        if (metric.compareTo(BigDecimal.ZERO) < 0 || metric.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException(metricName + " must be between 0 and 1");
        }
        return metric;
    }

    public static ModelPerformance createMockPerformance(ModelType modelType) {
        return new ModelPerformance(
                modelType,
                "1.0",
                new BigDecimal("0.92"),
                new BigDecimal("0.89"),
                new BigDecimal("0.91"),
                new BigDecimal("0.90"),
                true
        );
    }

    public boolean isHighPerformance() {
        return accuracy.compareTo(new BigDecimal("0.90")) >= 0 &&
                f1Score.compareTo(new BigDecimal("0.85")) >= 0;
    }

    public boolean needsRetraining() {
        return accuracy.compareTo(new BigDecimal("0.80")) < 0 ||
                f1Score.compareTo(new BigDecimal("0.75")) < 0;
    }

    public ModelType getModelType() { return modelType; }
    public String getVersion() { return version; }
    public BigDecimal getAccuracy() { return accuracy; }
    public BigDecimal getPrecision() { return precision; }
    public BigDecimal getRecall() { return recall; }
    public BigDecimal getF1Score() { return f1Score; }
    public boolean isActive() { return isActive; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ModelPerformance that = (ModelPerformance) o;
        return isActive == that.isActive &&
                modelType == that.modelType &&
                Objects.equals(version, that.version) &&
                Objects.equals(accuracy, that.accuracy) &&
                Objects.equals(precision, that.precision) &&
                Objects.equals(recall, that.recall) &&
                Objects.equals(f1Score, that.f1Score);
    }

    @Override
    public int hashCode() {
        return Objects.hash(modelType, version, accuracy, precision, recall, f1Score, isActive);
    }

    @Override
    public String toString() {
        return "ModelPerformance{" +
                "modelType=" + modelType +
                ", version='" + version + '\'' +
                ", accuracy=" + accuracy +
                ", precision=" + precision +
                ", recall=" + recall +
                ", f1Score=" + f1Score +
                ", isActive=" + isActive +
                '}';
    }
}