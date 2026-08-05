package com.passwordlessauth.banking_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT configuration for the banking service.
 * Reads the same secret as auth-service so tokens can be validated.
 */
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtConfig {
    private String secret = "dGVjaHJ1c2gtZGV2LXNlY3JldC1rZXktZm9yLWxvY2FsLWRldmVsb3BtZW50LW9ubHk=";
    private String issuer = "TechRush";
    private String audience = "techrush-app";
    
    
}
