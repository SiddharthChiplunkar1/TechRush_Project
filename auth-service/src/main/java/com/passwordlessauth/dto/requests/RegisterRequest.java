package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Must be valid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;
}
