package com.braintrust.shared.domain.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.io.Serializable;

/**
 * ✅ FIXED: ErrorResponseDTO with proper Jackson serialization support
 *
 * This DTO is used by GlobalExceptionHandler to return standardized error responses.
 *
 * Common issues that cause "No converter" error:
 * 1. Missing no-args constructor
 * 2. Missing getters
 * 3. Fields not accessible to Jackson
 * 4. Missing serialization annotations
 */
@Data                          // ✅ Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor             // ✅ CRITICAL: Jackson needs this for deserialization
@AllArgsConstructor            // ✅ Convenient for creating instances
@Builder                       // ✅ Builder pattern support
public class ErrorResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * ISO-8601 timestamp when the error occurred
     * Example: "2025-10-29T22:39:15.123Z"
     */
    @JsonProperty("timestamp")
    private String timestamp;

    /**
     * HTTP status code
     * Example: 404, 400, 500
     */
    @JsonProperty("status")
    private Integer status;

    /**
     * Short error description
     * Example: "Not Found", "Bad Request"
     */
    @JsonProperty("error")
    private String error;

    /**
     * Detailed error message for the user
     * Example: "User not found: U-TEACHER-001s"
     */
    @JsonProperty("message")
    private String message;

    /**
     * The path/endpoint where the error occurred
     * Example: "/api/users/U-TEACHER-001s/deactivate"
     */
    @JsonProperty("path")
    private String path;

    // ========================================
    // ✅ ALTERNATIVE: If you prefer records (Java 14+)
    // ========================================
    /*
    public record ErrorResponseDTO(
        String timestamp,
        Integer status,
        String error,
        String message,
        String path
    ) implements Serializable {}
    */

    // ========================================
    // ✅ ALTERNATIVE: Manual implementation (if not using Lombok)
    // ========================================
    /*
    private String timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;

    // No-args constructor (REQUIRED for Jackson)
    public ErrorResponseDTO() {}

    // All-args constructor
    public ErrorResponseDTO(String timestamp, Integer status, String error,
                           String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Getters (REQUIRED for Jackson serialization)
    public String getTimestamp() { return timestamp; }
    public Integer getStatus() { return status; }
    public String getError() { return error; }
    public String getMessage() { return message; }
    public String getPath() { return path; }

    // Setters (optional but recommended)
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public void setStatus(Integer status) { this.status = status; }
    public void setError(String error) { this.error = error; }
    public void setMessage(String message) { this.message = message; }
    public void setPath(String path) { this.path = path; }
    */
}