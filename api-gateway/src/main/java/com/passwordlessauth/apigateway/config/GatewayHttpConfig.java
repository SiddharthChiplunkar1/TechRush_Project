package com.passwordlessauth.apigateway.config;

import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(GatewayProperties.class)
public class GatewayHttpConfig {

    @Bean
    public RestTemplate restTemplate(GatewayProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofMillis(properties.getConnectTimeoutMillis()).toMillis());
        factory.setReadTimeout((int) Duration.ofMillis(properties.getReadTimeoutMillis()).toMillis());
        return new RestTemplate(factory);
    }
}
