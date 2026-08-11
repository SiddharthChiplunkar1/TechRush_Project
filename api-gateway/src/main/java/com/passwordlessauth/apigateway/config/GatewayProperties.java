package com.passwordlessauth.apigateway.config;

import java.net.URI;

import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    @NotBlank(message = "gateway.auth-url must be configured")
    private String authUrl;

    @NotBlank(message = "gateway.banking-url must be configured")
    private String bankingUrl;

    @NotBlank(message = "gateway.face-url must be configured")
    private String faceUrl;

    @NotBlank(message = "gateway.face-service-token must be configured")
    private String faceServiceToken;

    @NotBlank(message = "gateway.allowed-origins must be configured")
    private String allowedOrigins;

    @Min(value = 100, message = "gateway.connect-timeout-millis must be >= 100")
    @Max(value = 30000, message = "gateway.connect-timeout-millis must be <= 30000")
    private int connectTimeoutMillis = 3000;

    @Min(value = 100, message = "gateway.read-timeout-millis must be >= 100")
    @Max(value = 60000, message = "gateway.read-timeout-millis must be <= 60000")
    private int readTimeoutMillis = 10000;

    @Min(value = 1, message = "gateway.max-requests-per-minute must be >= 1")
    @Max(value = 10000, message = "gateway.max-requests-per-minute must be <= 10000")
    private int maxRequestsPerMinute = 120;

    public String getAuthUrl() {
        return authUrl;
    }

    public void setAuthUrl(String authUrl) {
        this.authUrl = authUrl;
    }

    public String getBankingUrl() {
        return bankingUrl;
    }

    public void setBankingUrl(String bankingUrl) {
        this.bankingUrl = bankingUrl;
    }

    public String getFaceUrl() {
        return faceUrl;
    }

    public void setFaceUrl(String faceUrl) {
        this.faceUrl = faceUrl;
    }

    public String getFaceServiceToken() {
        return faceServiceToken;
    }

    public void setFaceServiceToken(String faceServiceToken) {
        this.faceServiceToken = faceServiceToken;
    }

    public String getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public int getConnectTimeoutMillis() {
        return connectTimeoutMillis;
    }

    public void setConnectTimeoutMillis(int connectTimeoutMillis) {
        this.connectTimeoutMillis = connectTimeoutMillis;
    }

    public int getReadTimeoutMillis() {
        return readTimeoutMillis;
    }

    public void setReadTimeoutMillis(int readTimeoutMillis) {
        this.readTimeoutMillis = readTimeoutMillis;
    }

    public int getMaxRequestsPerMinute() {
        return maxRequestsPerMinute;
    }

    public void setMaxRequestsPerMinute(int maxRequestsPerMinute) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    @PostConstruct
    void validateTrustedServiceUrls() {
        validateServiceUrl("gateway.auth-url", authUrl);
        validateServiceUrl("gateway.banking-url", bankingUrl);
        validateServiceUrl("gateway.face-url", faceUrl);
    }

    private void validateServiceUrl(String propertyName, String value) {
        if (value == null || value.isBlank()) {
            return;
        }

        URI uri = URI.create(value);
        String scheme = uri.getScheme();

        if (scheme == null
                || (!scheme.equalsIgnoreCase("http")
                && !scheme.equalsIgnoreCase("https"))) {
            throw new IllegalStateException(propertyName + " must use http or https");
        }

        if (uri.getHost() == null) {
            throw new IllegalStateException(propertyName + " must include a host");
        }

        if (uri.getRawQuery() != null || uri.getFragment() != null) {
            throw new IllegalStateException(propertyName + " must not include query parameters or fragments");
        }
    }
}
