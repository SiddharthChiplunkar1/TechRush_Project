package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LoginStepUpVerifyRequest {
    @NotBlank private String challengeId;
    @NotBlank @Pattern(regexp = "^\\d{6}$") private String otp;
}
