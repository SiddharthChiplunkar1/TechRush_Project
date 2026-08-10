package com.passwordlessauth.dto.requests;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    // Deliberately empty: refresh credentials are accepted only from HttpOnly cookies.
}
