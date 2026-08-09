package com.passwordlessauth.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentRequest {

    /**
     * User being assessed.
     *
     * This value must come from a trusted authenticated/service context.
     * It must never be accepted directly from an untrusted frontend.
     */
    @NotBlank(message = "User ID is required")
    @Size(
            max = 100,
            message = "User ID must not exceed 100 characters"
    )
    private String userId;

    /**
     * Transaction amount being assessed.
     */
    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;

    /**
     * Beneficiary involved in the transaction.
     */
    @NotBlank(message = "Beneficiary ID is required")
    @Size(
            max = 100,
            message = "Beneficiary ID must not exceed 100 characters"
    )
    private String beneficiaryId;
}