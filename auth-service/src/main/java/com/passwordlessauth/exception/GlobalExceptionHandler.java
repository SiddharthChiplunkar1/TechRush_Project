package com.passwordlessauth.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.passwordlessauth.dto.responses.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

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
        return ApiResponse.error("Token expired. Please login again.");
    }

    @ExceptionHandler(FaceVerificationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleFaceVerification(FaceVerificationException ex) {
        log.error("Face verification error", ex);
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(TrustedDeviceNotFoundException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleTrustedDeviceNotFound(TrustedDeviceNotFoundException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(GoogleAuthException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleGoogleAuthFailed(GoogleAuthException ex) {
        return ApiResponse.error(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation failed: {}", errors);
        return ApiResponse.error("Validation failed");
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleMalformedJson(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        log.warn("Malformed JSON", ex);
        return ApiResponse.error("Malformed JSON request.");
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGenericException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ApiResponse.error(ex.getMessage());
    }
}