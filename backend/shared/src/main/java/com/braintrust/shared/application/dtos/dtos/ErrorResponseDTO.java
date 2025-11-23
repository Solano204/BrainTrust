package com.braintrust.shared.application.dtos.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public record ErrorResponseDTO(
        @JsonProperty("timestamp") String timestamp,
        @JsonProperty("status") Integer status,
        @JsonProperty("error") String error,
        @JsonProperty("message") String message,
        @JsonProperty("path") String path
) implements Serializable {}
