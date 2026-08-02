package com.passwordlessauth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {
    private String secret;
    private Long accessTokenExpiration = 900000L;
    private Long refreshTokenExpiration = 604800000L;
    private String issuer;
    private String audience;
}
