package com.braintrust.containerapp.rest;

import com.braintrust.identity.domain.exceptions.CatalogInUseException;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.shared.application.dtos.dtos.ErrorResponseDTO;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import com.braintrust.shared.domain.exception.DomainException;
import com.braintrust.shared.domain.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);



    @ExceptionHandler(CatalogInUseException.class)
    public ResponseEntity<SuccessResponseDTO> handleCatalogInUse(CatalogInUseException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new SuccessResponseDTO(false, ex.getMessage(), null));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<SuccessResponseDTO> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new SuccessResponseDTO(false, ex.getMessage(), null));
    }


    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(
            NotFoundException ex,
            WebRequest request
    ) {

        log.error("Resource not found: {}", ex.getMessage(), ex);


        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(
            BadCredentialsException ex,
            WebRequest request
    ) {
        log.error("Bad credentials at {}: {}",
                request.getDescription(false), ex.getMessage());

        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password",
                request.getDescription(false).replace("uri=", "")
        );
    }


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
                .body(error);
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
            log.debug("- Field '{}': {}", fieldName, errorMessage);
        });

        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponseDTO> handleInvalidPasswordException(
            InvalidPasswordException ex,
            WebRequest request
    ) {
        log.error("Invalid password error at {}: {}",
                request.getDescription(false), ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Invalid Password",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }


    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex,
            WebRequest request
    ) {
        log.error("Illegal state at {}: {}",
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
        log.error("Illegal argument at {}: {}",
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


    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponseDTO> handleDomainException(
            DomainException ex,
            WebRequest request
    ) {

        log.error("Domain exception at {}: {} | type={}",
                request.getDescription(false),
                ex.getMessage(),
                ex.getClass().getSimpleName(),
                ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Domain Error",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }


    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResource(NoResourceFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex,
            WebRequest request
    ) {

        log.error("Unexpected error at {}: {} | type={} | cause={}",
                request.getDescription(false),
                ex.getMessage(),
                ex.getClass().getName(),
                ex.getCause() != null ? ex.getCause().getMessage() : "N/A",
                ex);


        String detailedMessage = buildDetailedErrorMessage(ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                detailedMessage,
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }


    private String buildDetailedErrorMessage(Exception ex) {
        StringBuilder message = new StringBuilder(ex.getMessage());

        Throwable cause = ex.getCause();
        if (cause != null) {
            message.append(" | Root Cause: ")
                    .append(cause.getClass().getSimpleName())
                    .append(": ")
                    .append(cause.getMessage());
        }

        return message.toString();
    }
}