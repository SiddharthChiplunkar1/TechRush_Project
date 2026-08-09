package com.passwordlessauth.banking.dto;

import com.passwordlessauth.banking.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned when a transfer is initiated or confirmed.
 *
 * The transfer ID is generated and controlled by the backend.
 * The status is represented by the application's transaction state.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferResponse {

    /**
     * Backend-generated transfer identifier.
     */
    private String transferId;

    /**
     * Current state of the transfer.
     */
    private TransactionStatus status;
}