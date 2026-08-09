package com.passwordlessauth.banking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    private final String applicationName;
    private final String applicationVersion;
    private final String contactEmail;
    private final String contactUrl;

    public SwaggerConfig(
            @Value("${swagger.title:Banking Service API}") String applicationName,
            @Value("${swagger.version:1.0.0}") String applicationVersion,
            @Value("${swagger.contact.email:support@techrush.dev}") String contactEmail,
            @Value("${swagger.contact.url:https://techrush.dev}") String contactUrl
    ) {
        this.applicationName = applicationName;
        this.applicationVersion = applicationVersion;
        this.contactEmail = contactEmail;
        this.contactUrl = contactUrl;
    }

    /**
     * Public-facing API documentation.
     *
     * Internal service-to-service endpoints are intentionally excluded.
     */
    @Bean
    public GroupedOpenApi bankingApi() {
        return GroupedOpenApi.builder()
                .group("banking")
                .packagesToScan("com.passwordlessauth.banking")
                .pathsToMatch(
                        "/api/banking/**"
                )
                .build();
    }

    /**
     * OpenAPI definition.
     *
     * All protected API operations use Bearer JWT authentication.
     */
    @Bean
    public OpenAPI bankingOpenAPI() {

        SecurityScheme bearerScheme =
                new SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description(
                                "Bearer JWT issued by the Auth Service."
                        );

        SecurityRequirement securityRequirement =
                new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME);

        Contact contact =
                new Contact()
                        .name("TechRush")
                        .email(contactEmail)
                        .url(contactUrl);

        License license =
                new License()
                        .name("Proprietary");

        return new OpenAPI()
                .info(
                        new Info()
                                .title(applicationName)
                                .version(applicationVersion)
                                .description(
                                        "Banking Service API with JWT authentication, " +
                                                "transaction processing, and adaptive risk controls."
                                )
                                .contact(contact)
                                .license(license)
                )
                .addSecurityItem(securityRequirement)
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME_NAME,
                                        bearerScheme
                                )
                );
    }
}