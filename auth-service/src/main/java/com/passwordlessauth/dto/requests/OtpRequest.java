package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;
}
