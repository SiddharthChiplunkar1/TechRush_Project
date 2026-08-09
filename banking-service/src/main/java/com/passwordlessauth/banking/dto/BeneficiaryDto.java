package com.passwordlessauth.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryDto {

    /**
     * Assigned by the backend.
     *
     * The client must not be able to choose or modify this value.
     */
    private String id;

    @NotBlank(message = "Beneficiary name is required")
    @Size(
            min = 1,
            max = 100,
            message = "Beneficiary name must be between 1 and 100 characters"
    )
    private String name;

    @NotBlank(
            message = "Account identifier is required"
    )
    @Size(
            min = 1,
            max = 255,
            message = "Account identifier must not exceed 255 characters"
    )
    private String accountIdentifier;

    /**
     * Defaults to false.
     */
    private boolean favourite = false;
}