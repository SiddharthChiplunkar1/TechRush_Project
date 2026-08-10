package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Internal-only notification command. Ownership and persistence fields are never client supplied. */
@Data
public class InternalNotificationRequest {
    @NotBlank @Size(max = 100)
    private String userId;
    @NotBlank @Size(max = 64)
    private String type;
    @NotBlank @Size(max = 2000)
    private String message;
}
