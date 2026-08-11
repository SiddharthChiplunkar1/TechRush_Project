package com.passwordlessauth.apigateway.config;

import java.net.SocketTimeoutException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;

@RestControllerAdvice
public class GatewayExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayExceptionHandler.class);
    private static final String REQUEST_ID_HEADER = RequestIdFilter.HEADER_NAME;

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUpstream(
            ResourceAccessException ex,
            HttpServletRequest request
    ) {
        HttpStatus status = isTimeout(ex)
                ? HttpStatus.GATEWAY_TIMEOUT
                : HttpStatus.BAD_GATEWAY;
        log.warn(
                "requestId={} type={} status={}",
                request.getAttribute(REQUEST_ID_HEADER),
                ex.getClass().getSimpleName(),
                status.value()
        );

        return build(
                status,
                status == HttpStatus.GATEWAY_TIMEOUT
                        ? "UPSTREAM_TIMEOUT"
                        : "UPSTREAM_UNAVAILABLE",
                status == HttpStatus.GATEWAY_TIMEOUT
                        ? "The requested service timed out"
                : "The requested service is temporarily unavailable",
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
        log.warn(
                "requestId={} type={} status=400",
                request.getAttribute(REQUEST_ID_HEADER),
                ex.getClass().getSimpleName()
        );
        return build(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "The request is invalid",
                request
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedRequest(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {
        log.warn(
                "requestId={} type={} status=400",
                request.getAttribute(REQUEST_ID_HEADER),
                ex.getClass().getSimpleName()
        );
        return build(
                HttpStatus.BAD_REQUEST,
                "MALFORMED_REQUEST",
                "The request body is malformed",
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error(
                "requestId={} type={} status=500",
                request.getAttribute(REQUEST_ID_HEADER),
                ex.getClass().getSimpleName()
        );
        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred",
                request
        );
    }

    private ResponseEntity<Map<String, Object>> build(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest request
    ) {
        String requestId = request.getAttribute(REQUEST_ID_HEADER) instanceof String id ? id : null;

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", false);
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());

        if (requestId != null && !requestId.isBlank()) {
            body.put("requestId", requestId);
        }

        ResponseEntity.BodyBuilder builder = ResponseEntity.status(status);
        if (requestId != null && !requestId.isBlank()) {
            builder.header(REQUEST_ID_HEADER, requestId);
        }

        return builder.body(body);
    }

    private boolean isTimeout(ResourceAccessException ex) {
        Throwable cause = ex.getCause();
        while (cause != null) {
            if (cause instanceof SocketTimeoutException) {
                return true;
            }
            cause = cause.getCause();
        }

        String message = ex.getMessage();
        return message != null && message.toLowerCase().contains("timed out");
    }
}
