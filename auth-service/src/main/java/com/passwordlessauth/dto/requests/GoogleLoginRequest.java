package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Authorization code is required")
    private String authorizationCode;

    @NotBlank(message = "Redirect URI is required")
    private String redirectUri;
}
