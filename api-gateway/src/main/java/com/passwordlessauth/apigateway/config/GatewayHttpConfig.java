package com.passwordlessauth.apigateway.config;

import java.io.IOException;
import java.time.Duration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(GatewayProperties.class)
public class GatewayHttpConfig {

    private static final ResponseErrorHandler PASSTHROUGH_ERROR_HANDLER = new ResponseErrorHandler() {
        @Override
        public boolean hasError(ClientHttpResponse response) throws IOException {
            return false;
        }

        @Override
        public void handleError(ClientHttpResponse response) throws IOException {
        }
    };

    @Bean
    public RestTemplate restTemplate(GatewayProperties properties) {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout((int) Duration.ofMillis(properties.getReadTimeoutMillis()).toMillis());
        RestTemplate template = new RestTemplate(factory);
        template.setErrorHandler(PASSTHROUGH_ERROR_HANDLER);
        return template;
    }
}
