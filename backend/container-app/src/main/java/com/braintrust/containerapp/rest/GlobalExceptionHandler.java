package com.braintrust.containerapp.rest;

import com.braintrust.identity.domain.exceptions.CatalogInUseException;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.PersonHasLinkedUserException;
import com.braintrust.identity.infraestructure.security.exception.JwtTokenException;
import com.braintrust.shared.application.dtos.dtos.ErrorResponseDTO;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import com.braintrust.shared.domain.exception.DomainException;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import com.braintrust.shared.domain.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Unique constraint violations (CURP, RFC, Email duplicados) ────────────

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDTO> handleDataIntegrityViolation(
            DataIntegrityViolationException ex,
            WebRequest request) {

        String path = extractPath(request);
        String rootMessage = getRootCauseMessage(ex);
        String friendlyMessage = resolveDuplicateMessage(rootMessage);

        log.warn("⚠️ Data integrity violation at {}: {}", path, rootMessage);

        return buildErrorResponse(HttpStatus.CONFLICT, friendlyMessage, path);
    }

    /**
     * Inspects the root cause message and returns a human-friendly Spanish message
     * depending on which unique constraint was violated.
     */
    private String resolveDuplicateMessage(String rootMessage) {
        if (rootMessage == null) return "Ya existe un registro con los datos proporcionados.";

        String lower = rootMessage.toLowerCase();

        if (lower.contains("uq_persons_curp") || lower.contains("persons_curp_key")) {
            return "El CURP ingresado ya está registrado. Verifique los datos e intente de nuevo.";
        }
        if (lower.contains("uq_persons_rfc") || lower.contains("persons_rfc_key")) {
            return "El RFC ingresado ya está registrado. Verifique los datos e intente de nuevo.";
        }
        if (lower.contains("email") || lower.contains("users_email_key")) {
            return "El correo electrónico ya está registrado. Por favor use otro email.";
        }
        if (lower.contains("uq_users_person_role") || lower.contains("person_role")) {
            return "Esta persona ya tiene una cuenta con ese rol. Una persona puede tener máximo un usuario por tipo de rol.";
        }
        if (lower.contains("student_id")) {
            return "El ID de estudiante ya está en uso. Verifique los datos.";
        }

        // Generic fallback — still better than a raw stack trace
        return "Ya existe un registro con los datos proporcionados. Verifique e intente de nuevo.";
    }

    // ── Email already exists ──────────────────────────────────────────────────

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex,
            WebRequest request) {

        log.warn("⚠️ Email already exists: {}", ex.getMessage());
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                "El correo electrónico ya está registrado. Por favor use otro email.",
                extractPath(request));
    }

    // ── Person has linked user (no se puede eliminar) ─────────────────────────

    @ExceptionHandler(PersonHasLinkedUserException.class)
    public ResponseEntity<ErrorResponseDTO> handlePersonHasLinkedUser(
            PersonHasLinkedUserException ex,
            WebRequest request) {

        log.warn("⚠️ Cannot delete person — has linked user: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), extractPath(request));
    }

    // ── Catalog in use ────────────────────────────────────────────────────────

    @ExceptionHandler(CatalogInUseException.class)
    public ResponseEntity<ErrorResponseDTO> handleCatalogInUse(
            CatalogInUseException ex,
            WebRequest request) {

        log.warn("⚠️ Catalog in use: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), extractPath(request));
    }

    // ── Not found ─────────────────────────────────────────────────────────────

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(
            NotFoundException ex,
            WebRequest request) {

        log.warn("❌ Resource not found: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), extractPath(request));
    }

    // ── Invalid password ──────────────────────────────────────────────────────

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidPasswordException(
            InvalidPasswordException ex,
            WebRequest request) {

        log.warn("❌ Invalid password: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), extractPath(request));
    }

    // ── Bad credentials ───────────────────────────────────────────────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(
            BadCredentialsException ex,
            WebRequest request) {

        log.warn("❌ Bad credentials at {}", extractPath(request));
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Correo electrónico o contraseña incorrectos.",
                extractPath(request));
    }

    // ── Illegal state (CURP/RFC inmutables, rol duplicado) ───────────────────

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex,
            WebRequest request) {

        log.warn("❌ Illegal state at {}: {}", extractPath(request), ex.getMessage());
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage(), extractPath(request));
    }

    // ── Illegal argument (CURP formato inválido, edad fuera de rango) ─────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {

        log.warn("❌ Illegal argument at {}: {}", extractPath(request), ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), extractPath(request));
    }

    // ── Domain exception ──────────────────────────────────────────────────────

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponseDTO> handleDomainException(
            DomainException ex,
            WebRequest request) {

        log.error("❌ Domain exception at {}: {}", extractPath(request), ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), extractPath(request));
    }

    // ── Validation errors (@Valid) ────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            WebRequest request) {

        log.warn("⚠️ Validation failed at {}: {} field error(s)",
                extractPath(request), ex.getBindingResult().getFieldErrorCount());

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field   = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
            log.debug("  - Field '{}': {}", field, message);
        });

        return ResponseEntity.badRequest().body(errors);
    }

    // ── RuntimeException — unwrap cause if DataIntegrityViolation ────────────

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleRuntime(
            RuntimeException ex,
            WebRequest request) {

        // Unwrap: "Failed to create person" → cause = DataIntegrityViolationException
        Throwable cause = ex.getCause();
        while (cause != null) {
            if (cause instanceof DataIntegrityViolationException dive) {
                return handleDataIntegrityViolation(dive, request);
            }
            cause = cause.getCause();
        }

        String path = extractPath(request);
        log.error("❌ Runtime error at {}: {}", path, ex.getMessage(), ex);
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage() != null ? ex.getMessage() : "Error inesperado.",
                path);
    }

    // ── Global fallback ───────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex,
            WebRequest request) {

        String path = extractPath(request);
        log.error("❌❌❌ UNEXPECTED ERROR at {}: {} | Type: {}",
                path, ex.getMessage(), ex.getClass().getName(), ex);

        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado. Por favor intente más tarde.",
                path);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
            HttpStatus status, String message, String path) {

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    /** Traverses the full cause chain to get the deepest error message. */
    private String getRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getMessage();
    }
}