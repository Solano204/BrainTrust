package com.braintrust.aidetectition.domain.valueobjects;


public enum ModelType {
    GPT_DETECTOR("GPT Detector", "v2.1"),
    BERT_CLASSIFIER("BERT Classifier", "v1.5"),
    ENSEMBLE("Ensemble Model", "v3.0");

    private final String displayName;
    private final String version;

    ModelType(String displayName, String version) {
        this.displayName = displayName;
        this.version = version;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getVersion() {
        return version;
    }
}
