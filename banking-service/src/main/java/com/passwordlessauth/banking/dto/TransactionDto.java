package com.passwordlessauth.banking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {

    /**
     * Public transaction identifier used by the client when displaying
     * or referencing a transaction.
     */
    private String transactionId;

    /**
     * Internal account identifier.
     *
     * TODO:
     * Consider replacing this with a masked/user-friendly representation
     * before exposing the API publicly.
     */
    private String fromAccountId;

    /**
     * Internal account identifier.
     *
     * TODO:
     * Consider replacing this with a masked/user-friendly representation
     * before exposing the API publicly.
     */
    private String toAccountId;

    /**
     * Transaction amount.
     *
     * The service layer must ensure this is positive and that the
     * authenticated user is authorized to see the transaction.
     */
    private BigDecimal amount;

    /**
     * Transaction lifecycle status.
     *
     * Expected values correspond to TransactionStatus.
     */
    private String status;

    /**
     * Time at which the transaction was created.
     */
    private Instant createdAt;

    /**
     * Optional transaction description/reference.
     *
     * This should not contain secrets, authentication tokens, or
     * unnecessary sensitive information.
     */
    private String description;

    /**
     * Risk classification associated with the transaction.
     *
     * Expected values:
     * LOW, MEDIUM, HIGH, CRITICAL
     */
    private String riskLevel;
}