package com.passwordlessauth.dto.responses;

import com.passwordlessauth.enums.AuthLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresIn;          // Seconds until expiry
    private UserResponse user;
    private boolean isNewDevice;     // True if device first seen
    private AuthLevel authLevel;     // Current authentication level
}