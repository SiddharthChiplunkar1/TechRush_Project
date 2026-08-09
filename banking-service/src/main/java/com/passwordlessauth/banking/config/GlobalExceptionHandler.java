package com.passwordlessauth.banking.config;

import com.passwordlessauth.banking.exceptions.FraudDetectedException;
import com.passwordlessauth.banking.exceptions.InsufficientFundsException;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.exceptions.UnauthorizedAccessException;

import jakarta.validation.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String SUCCESS_KEY = "success";
    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String TIMESTAMP_KEY = "timestamp";

    /**
     * Resource does not exist.
     *
     * Example:
     * GET /api/banking/transactions/does-not-exist
     */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            NotFoundException ex
    ) {

        log.debug(
                "Banking resource not found: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "RESOURCE_NOT_FOUND",
                "The requested resource was not found."
        );
    }

    /**
     * Insufficient funds.
     *
     * This is a business failure, not a server error.
     */
    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientFunds(
            InsufficientFundsException ex
    ) {

        log.info(
                "Transaction rejected due to insufficient funds: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "INSUFFICIENT_FUNDS",
                "The transaction could not be completed because of insufficient funds."
        );
    }

    /**
     * Fraud/risk policy rejection.
     *
     * Do not expose the internal fraud rule that triggered the rejection.
     */
    @ExceptionHandler(FraudDetectedException.class)
    public ResponseEntity<Map<String, Object>> handleFraud(
            FraudDetectedException ex
    ) {

        log.warn(
                "Transaction rejected by fraud/risk controls: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "TRANSACTION_BLOCKED",
                "The transaction was blocked by security controls."
        );
    }

    /**
     * Authenticated user attempted an operation they do not own.
     *
     * This is particularly important for preventing IDOR.
     */
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedAccess(
            UnauthorizedAccessException ex
    ) {

        log.warn(
                "Unauthorized banking resource access attempt: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "You are not authorized to access this resource."
        );
    }

    /**
     * Invalid application/business input.
     *
     * IMPORTANT:
     * Do not return ex.getMessage() directly. The message may contain
     * internal implementation details or user-controlled information.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex
    ) {

        log.debug(
                "Invalid banking request: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "The request contains invalid data."
        );
    }

    /**
     * Bean Validation failure.
     *
     * Handles:
     * @Valid @RequestBody
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> {

                    String field = error.getField();
                    String message = error.getDefaultMessage();

                    validationErrors.put(
                            field,
                            message != null
                                    ? message
                                    : "Invalid value"
                    );
                });

        /*
         * Do not log submitted values here.
         *
         * Banking requests may contain sensitive information.
         */
        log.debug(
                "Request validation failed for {} field(s)",
                validationErrors.size()
        );

        Map<String, Object> body = baseErrorBody(
                "VALIDATION_FAILED",
                "One or more request fields are invalid."
        );

        body.put("errors", validationErrors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }

    /**
     * Bean Validation failure for:
     * @RequestParam
     * @PathVariable
     * @RequestHeader
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex
    ) {

        Map<String, String> validationErrors =
                new LinkedHashMap<>();

        ex.getConstraintViolations().forEach(violation -> {

            String property = violation.getPropertyPath().toString();
            String message = violation.getMessage();

            validationErrors.put(
                    property,
                    message != null
                            ? message
                            : "Invalid value"
            );
        });

        log.debug(
                "Constraint validation failed for {} field(s)",
                validationErrors.size()
        );

        Map<String, Object> body = baseErrorBody(
                "VALIDATION_FAILED",
                "One or more request parameters are invalid."
        );

        body.put("errors", validationErrors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }

    /**
     * Malformed JSON / unreadable request body.
     *
     * Prevents Jackson's internal parsing message from leaking to clients.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(
            HttpMessageNotReadableException ex
    ) {

        log.debug(
                "Request body could not be parsed: {}",
                safeExceptionType(ex)
        );

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "MALFORMED_REQUEST",
                "The request body is invalid or malformed."
        );
    }

    /**
     * Catch-all handler.
     *
     * NEVER return the actual exception message to the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(
            Exception ex
    ) {

        /*
         * Full exception is available in server logs for debugging,
         * but never exposed to the client.
         */
        log.error(
                "Unexpected error in banking service: {}",
                safeExceptionType(ex),
                ex
        );

        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred. Please try again later."
        );
    }

    /**
     * Creates the standard external error response.
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String errorCode,
            String message
    ) {

        Map<String, Object> body =
                baseErrorBody(errorCode, message);

        return ResponseEntity
                .status(status)
                .body(body);
    }

    /**
     * Common response structure.
     */
    private Map<String, Object> baseErrorBody(
            String errorCode,
            String message
    ) {

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(SUCCESS_KEY, false);
        body.put(ERROR_KEY, errorCode);
        body.put(MESSAGE_KEY, message);
        body.put(TIMESTAMP_KEY, Instant.now().toString());

        return body;
    }

    /**
     * Only expose exception type in logs.
     *
     * This intentionally avoids putting exception messages containing
     * potentially sensitive banking/request data into normal logs.
     */
    private String safeExceptionType(Exception ex) {

        if (ex == null) {
            return "UnknownException";
        }

        return ex.getClass().getSimpleName();
    }
}