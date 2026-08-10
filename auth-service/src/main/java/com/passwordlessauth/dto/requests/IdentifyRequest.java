package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IdentifyRequest {
    @NotBlank @Email
    private String email;
}
