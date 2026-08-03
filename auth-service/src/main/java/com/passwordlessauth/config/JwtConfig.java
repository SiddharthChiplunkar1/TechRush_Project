package com.passwordlessauth.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtConfig {
    private String secret;
    private Long accessTokenExpiration = 900_000L;
    private Long refreshTokenExpiration = 604_800_000L;
    private String issuer = "TechRush";
    private String audience = "techrush-app";
}