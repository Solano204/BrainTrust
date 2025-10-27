package com.braintrust.containerapp.rest;

// 📍 shared/infrastructure/exception/GlobalExceptionHandler.java

import com.braintrust.shared.application.dtos.*;
import com.braintrust.shared.application.dtos.dtos.ErrorResponseDTO;
import com.braintrust.shared.domain.exception.DomainException;
import com.braintrust.shared.domain.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ✅ NOT FOUND EXCEPTIONS
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponseDTO> handleNotFoundException(
            NotFoundException ex,
            WebRequest request
    ) {
        logger.error("Resource not found: {}", ex.getMessage());

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

//    // ✅ ALREADY EXISTS EXCEPTIONS
//    @ExceptionHandler(AlreadyExistsException.class)
//    public ResponseEntity<ErrorResponseDTO> handleAlreadyExistsException(
//            AlreadyExistsException ex,
//            WebRequest request
//    ) {
//        logger.error("Resource already exists: {}", ex.getMessage());
//
//        ErrorResponseDTO error = new ErrorResponseDTO(
//                Instant.now().toString(),
//                HttpStatus.CONFLICT.value(),
//                "Conflict",
//                ex.getMessage(),
//                request.getDescription(false).replace("uri=", "")
//        );
//
//        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
//    }

    // ✅ ILLEGAL STATE EXCEPTIONS
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalStateException(
            IllegalStateException ex,
            WebRequest request
    ) {
        logger.error("Illegal state: {}", ex.getMessage());

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ✅ ILLEGAL ARGUMENT EXCEPTIONS
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDTO> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request
    ) {
        logger.error("Illegal argument: {}", ex.getMessage());

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ✅ VALIDATION EXCEPTIONS
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ValidationErrorResponseDTO> handleValidationExceptions(
//            MethodArgumentNotValidException ex,
//            WebRequest request
//    ) {
//        logger.error("Validation failed: {}", ex.getMessage());
//
//        List<ValidationErrorDTO> errors = ex.getBindingResult()
//                .getFieldErrors()
//                .stream()
//                .map(error -> new ValidationErrorDTO(
//                        error.getField(),
//                        error.getDefaultMessage(),
//                        error.getRejectedValue()
//                ))
//                .collect(Collectors.toList());
//
//        ValidationErrorResponseDTO response = new ValidationErrorResponseDTO(
//                Instant.now().toString(),
//                HttpStatus.BAD_REQUEST.value(),
//                "Validation Failed",
//                "Input validation failed",
//                request.getDescription(false).replace("uri=", ""),
//                errors
//        );
//
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
//    }

    // ✅ GENERIC DOMAIN EXCEPTIONS
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponseDTO> handleDomainException(
            DomainException ex,
            WebRequest request
    ) {
        logger.error("Domain exception: {}", ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.BAD_REQUEST.value(),
                "Domain Error",
                ex.getMessage(),
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ✅ GENERIC EXCEPTIONS
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex,
            WebRequest request
    ) {
        logger.error("Unexpected error occurred: {}", ex.getMessage(), ex);

        ErrorResponseDTO error = new ErrorResponseDTO(
                Instant.now().toString(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                request.getDescription(false).replace("uri=", "")
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}