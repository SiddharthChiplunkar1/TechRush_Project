package com.passwordlessauth.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class FaceEnrollRequest {
    @Size(min = 5, max = 15, message = "Five to fifteen face frames are required")
    private List<@NotBlank(message = "Face image data is required") String> faceImages;
}
