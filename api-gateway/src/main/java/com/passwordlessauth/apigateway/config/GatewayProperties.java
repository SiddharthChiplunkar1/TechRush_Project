package com.passwordlessauth.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    private String authUrl;
    private String bankingUrl;
    private String faceUrl;
    private String faceServiceToken;
    private String allowedOrigins = "";
    private int connectTimeoutMillis = 3000;
    private int readTimeoutMillis = 10000;
    private int maxRequestsPerMinute = 120;

    public String getAuthUrl() { return authUrl; }
    public void setAuthUrl(String authUrl) { this.authUrl = authUrl; }
    public String getBankingUrl() { return bankingUrl; }
    public void setBankingUrl(String bankingUrl) { this.bankingUrl = bankingUrl; }
    public String getFaceUrl() { return faceUrl; }
    public void setFaceUrl(String faceUrl) { this.faceUrl = faceUrl; }
    public String getFaceServiceToken() { return faceServiceToken; }
    public void setFaceServiceToken(String faceServiceToken) { this.faceServiceToken = faceServiceToken; }
    public String getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(String allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    public int getConnectTimeoutMillis() { return connectTimeoutMillis; }
    public void setConnectTimeoutMillis(int connectTimeoutMillis) { this.connectTimeoutMillis = connectTimeoutMillis; }
    public int getReadTimeoutMillis() { return readTimeoutMillis; }
    public void setReadTimeoutMillis(int readTimeoutMillis) { this.readTimeoutMillis = readTimeoutMillis; }
    public int getMaxRequestsPerMinute() { return maxRequestsPerMinute; }
    public void setMaxRequestsPerMinute(int maxRequestsPerMinute) { this.maxRequestsPerMinute = maxRequestsPerMinute; }
}
