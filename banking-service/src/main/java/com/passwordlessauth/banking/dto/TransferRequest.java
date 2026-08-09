package com.passwordlessauth.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request to initiate a transfer.
 *
 * The authenticated user is ALWAYS the source of the transfer.
 * The client must never provide a source user ID.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    /**
     * Recipient user/account identifier.
     *
     * This must be validated against the actual beneficiary/account
     * during the transfer flow.
     */
    @NotBlank(message = "Recipient user ID is required")
    @Size(
            max = 100,
            message = "Recipient user ID must not exceed 100 characters"
    )
    private String toUserId;

    /**
     * Amount to transfer.
     */
    @NotNull(message = "Amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Amount must be at least 0.01"
    )
    private BigDecimal amount;

    /**
     * Optional transaction description/reference.
     */
    @Size(
            max = 255,
            message = "Description must not exceed 255 characters"
    )
    private String description;
}