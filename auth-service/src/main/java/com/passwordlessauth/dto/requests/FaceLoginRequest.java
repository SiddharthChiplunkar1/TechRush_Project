package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class FaceLoginRequest {
    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Face image is required")
    private String faceImage;

    @Size(min = 5, max = 15, message = "Five to fifteen face frames are required")
    private List<@NotBlank String> faceImages;
}
