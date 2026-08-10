package com.passwordlessauth.dto.responses;

import com.passwordlessauth.enums.AuthLevel;
import lombok.Builder;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Builder
public class JwtResponse {
    @JsonIgnore
    private String refreshToken;
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;          // Seconds until expiry
    private UserResponse user;
    private boolean isNewDevice;     // True if device first seen
    private AuthLevel authLevel;     // Current authentication level
    private String authenticationState;
    private String authenticationChallenge;
    private String requiredAuthenticationMethod;
}
