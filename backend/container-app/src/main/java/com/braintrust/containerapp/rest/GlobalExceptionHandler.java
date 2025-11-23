package com.braintrust.containerapp.rest;

import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.infraestructure.security.exception.JwtTokenException;
import com.braintrust.shared.application.dtos.dtos.ErrorResponseDTO;
import com.braintrust.shared.domain.exception.DomainException;
import com.braintrust.shared.domain.exception.NotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RestControllerAdvice;
// other imports...

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ========================================
    // ✅ AUTHENTICATION & AUTHORIZATION EXCEPTIONS
    // ========================================
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(
            NotFoundException ex,
            WebRequest request
    ) {
        // Log the actual type and message.
        log.error("❌ Resource not found: {}", ex.getMessage(), ex);

        // ⚠️ Spring will automatically set the 404 status because of @ResponseStatus(NOT_FOUND)
        // We only need to return the DTO and let Spring handle the status code via the annotation.

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.NOT_FOUND.value(), // Note: Using NOT_FOUND here is fine
                "Not Found",
                ex.getMessage(), // ⬅️ The specific domain message is passed here
                request.getDescription(false).replace("uri=", "")
        );

        // Returning the ResponseEntity with the DTO. Spring will apply the status code.
        return ResponseEntity.status(HttpStatus.NOT_FOUND) // Explicit status for clarity
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // 📍 FIX: And applied the same simplified pattern to the main Auth handlers:
// (Example of the BadCredentialsException being simplified to use the helper)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(
            BadCredentialsException ex,
            WebRequest request
    ) {
        log.error("Bad credentials at {}: {}",
                request.getDescription(false), ex.getMessage());

        return buildErrorResponse( // ⬅️ Calling the fixed helper method
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password",
                request.getDescription(false).replace("uri=", "")
        );
    }

    // 📍 FIX: The Private Helper Method (Final corrected state)
    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
            HttpStatus status,
            String message,
            String path
    ) {
        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );

        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error); // Return the fully constructed DTO object
    }







    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            WebRequest request
    ) {
        log.warn("Validation failed at {}: {} field errors",
                request.getDescription(false),
                ex.getBindingResult().getFieldErrorCount());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
            log.debug("  - Field '{}': {}", fieldName, errorMessage);
        });

        return ResponseEntity.badRequest().body(errors);
    }

    // ========================================
    // ✅ DOMAIN-SPECIFIC EXCEPTIONS (NEW!)
    // ========================================

    /**
     * Handles InvalidPasswordException specifically
     * This provides detailed feedback for password-related errors
     */
    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidPasswordException(
            InvalidPasswordException ex,
            WebRequest request
    ) {
        log.error("❌ Invalid password error at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Password",
                ex.getMessage(), // ✅ Mensaje específico del dominio
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ========================================
    // ✅ GENERIC DOMAIN & SYSTEM EXCEPTIONS
    // ========================================



    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex,
            WebRequest request
    ) {
        log.error("❌ Illegal state at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request
    ) {
        log.error("❌ Illegal argument at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    /**
     * ⚠️ CRITICAL FIX: Added full stack trace logging
     * This catches all DomainExceptions and logs the complete error details
     */
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponseDTO> handleDomainException(
            DomainException ex,
            WebRequest request
    ) {
        // ✅ FIX: Log the FULL stack trace, not just the message
        log.error("❌ Domain exception at {}: {} | Exception Type: {}",
                request.getDescription(false),
                ex.getMessage(),
                ex.getClass().getSimpleName(),
                ex); // ← This logs the full stack trace

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Domain Error",
                ex.getMessage(), // ✅ Returns the specific domain message
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    /**
     * ⚠️ CRITICAL: This is your last line of defense
     * Logs EVERYTHING and returns detailed info in DEV mode
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex,
            WebRequest request
    ) {
        // ✅ FIX: Log complete error details with stack trace
        log.error("❌❌❌ UNEXPECTED ERROR at {}: {} | Exception Type: {} | Root Cause: {}",
                request.getDescription(false),
                ex.getMessage(),
                ex.getClass().getName(),
                ex.getCause() != null ? ex.getCause().getMessage() : "N/A",
                ex); // ← Full stack trace

        // ✅ OPTIONAL: Return more details in development mode
        String detailedMessage = buildDetailedErrorMessage(ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                detailedMessage, // ✅ More informative message
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ========================================
    // ✅ PRIVATE HELPER METHODS
    // ========================================

    /**
     * Builds a standardized error response with proper content type
     */

    /**
     * ✅ NEW: Builds detailed error message for debugging
     * In production, you might want to make this less verbose
     */
    private String buildDetailedErrorMessage(Exception ex) {
        StringBuilder message = new StringBuilder(ex.getMessage());

        // Add root cause if available
        Throwable cause = ex.getCause();
        if (cause != null) {
            message.append(" | Root Cause: ")
                    .append(cause.getClass().getSimpleName())
                    .append(": ")
                    .append(cause.getMessage());
        }

        // ⚠️ SECURITY NOTE: In production, return generic message
        // You can add a profile check here:
        // if (environment.acceptsProfiles(Profiles.of("dev", "local"))) {
        //     return detailed message
        // } else {
        //     return "An unexpected error occurred"
        // }

        return message.toString();
    }
}