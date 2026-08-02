package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for trusted-device login.
 *
 * A trusted-device login skips OTP/Face/Google verification because the
 * device has been explicitly marked as trusted by the user on a previous
 * STRONG-auth session.  The resulting token carries {@code authLevel = WEAK}.
 *
 * The frontend should include the {@code X-Device-Fingerprint} header so that
 * the server can match the fingerprint against the trusted-devices table.
 */
@Data
public class TrustedDeviceLoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;
}
