package com.passwordlessauth.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmTransferRequest {

    /**
     * ID of the pending transfer to confirm or cancel.
     *
     * The backend must verify that this transfer belongs to the
     * authenticated user before performing any operation.
     */
    @NotBlank(message = "Transfer ID is required")
    @Size(
            max = 100,
            message = "Transfer ID must not exceed 100 characters"
    )
    private String transferId;

    /**
     * true  -> confirm the pending transfer
     * false -> cancel the pending transfer
     */
    private boolean confirm;
}