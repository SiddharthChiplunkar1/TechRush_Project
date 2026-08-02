package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FaceEnrollRequest {
    @NotBlank(message = "Face image data is required")
    private String faceImage;
}
