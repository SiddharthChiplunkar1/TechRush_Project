package com.passwordlessauth.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Validated
@Getter
@Setter
public class JwtConfig {

    /**
     * Base64-encoded signing secret.
     *
     * Must be supplied through environment/secret management.
     */
    @NotBlank(message = "JWT secret must be configured")
    private String secret;

    /**
     * Access token lifetime.
     * Default: 15 minutes.
     */
    @Min(
            value = 60_000,
            message = "Access token expiration must be at least 1 minute"
    )
    @Max(
            value = 3_600_000,
            message = "Access token expiration must not exceed 1 hour"
    )
    private long accessTokenExpiration = 900_000L;

    /**
     * Refresh token lifetime.
     * Default: 7 days.
     */
    @Min(
            value = 300_000,
            message = "Refresh token expiration must be at least 5 minutes"
    )
    @Max(
            value = 2_592_000_000L,
            message = "Refresh token expiration must not exceed 30 days"
    )
    private long refreshTokenExpiration = 604_800_000L;

    /**
     * JWT issuer.
     */
    @NotBlank(message = "JWT issuer must be configured")
    private String issuer;

    /**
     * JWT audience.
     */
    @NotBlank(message = "JWT audience must be configured")
    private String audience;
}