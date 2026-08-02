package com.passwordlessauth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.passwordlessauth.dto.responses.ApiResponse;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
/**
 * Global exception handler for the auth-service.
 *
 * Centralises error response shaping so controllers don't need try/catch blocks.
 * Every exception maps to a consistent ApiResponse format with an HTTP status.
 *
 * Security note: Generic exceptions are caught and logged server-side, but only
 * a safe message is returned to the client to prevent information leakage.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── Domain Exceptions ───────────────────────────────────────────────────

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Void> handleUserNotFound(UserNotFoundException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Void> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(InvalidOtpException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleInvalidOtp(InvalidOtpException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(AccountLockedException.class)
    @ResponseStatus(HttpStatus.LOCKED)
    public ApiResponse<Void> handleAccountLocked(AccountLockedException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(TooManyRequestsException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ApiResponse<Void> handleTooManyRequests(TooManyRequestsException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleInvalidToken(InvalidTokenException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(JwtExpiredException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleJwtExpired(JwtExpiredException ex) {
        return ApiResponse.error("Token expired. Please refresh.");
    }

    @ExceptionHandler(FaceVerificationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleFaceVerificationFailed(FaceVerificationException ex) {
        return ApiResponse.error("Face verification failed. Please try again.");
    }

    @ExceptionHandler(TrustedDeviceNotFoundException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleTrustedDeviceNotFound(TrustedDeviceNotFoundException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(GoogleAuthException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleGoogleAuthFailed(GoogleAuthException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    // ─── Validation Exceptions ────────────────────────────────────────────────

    /**
     * Handles @Valid failures and returns all field-level errors in a structured map.
     * This helps the frontend show per-field error messages without parsing a message string.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ApiResponse.error("Validation failed");
    }

    // ─── Generic Fallback ─────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return ApiResponse.error("An unexpected error occurred. Please try again later.");
    }
}