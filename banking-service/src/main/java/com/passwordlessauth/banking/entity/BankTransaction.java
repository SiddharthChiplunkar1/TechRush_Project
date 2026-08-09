package com.passwordlessauth.banking.entity;

import com.passwordlessauth.banking.enums.RiskLevel;
import com.passwordlessauth.banking.enums.TransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "bank_transactions",
        indexes = {
                @Index(
                        name = "idx_bank_tx_from_account",
                        columnList = "from_account_id"
                ),
                @Index(
                        name = "idx_bank_tx_to_account",
                        columnList = "to_account_id"
                ),
                @Index(
                        name = "idx_bank_tx_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_bank_tx_created_at",
                        columnList = "created_at"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class BankTransaction {

    private static final int MAX_DESCRIPTION_LENGTH = 500;

    /**
     * Backend-generated transaction identifier.
     */
    @Id
    @Column(
            name = "transaction_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String transactionId;

    /**
     * Source account.
     *
     * This is immutable after transaction creation.
     */
    @Column(
            name = "from_account_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String fromAccountId;

    /**
     * Destination account.
     *
     * This is immutable after transaction creation.
     */
    @Column(
            name = "to_account_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String toAccountId;

    /**
     * Transaction amount.
     *
     * Monetary values use BigDecimal and database precision/scale.
     */
    @Column(
            nullable = false,
            precision = 19,
            scale = 2,
            updatable = false
    )
    private BigDecimal amount;

    /**
     * Current lifecycle state of the transaction.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 40
    )
    private TransactionStatus status;

    /**
     * Optional user-provided transaction description.
     */
    @Column(
            length = MAX_DESCRIPTION_LENGTH
    )
    private String description;

    /**
     * Risk classification assigned during transfer evaluation.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "risk_level",
            length = 20
    )
    private RiskLevel riskLevel;

    /**
     * Creation timestamp.
     *
     * Never changed after insertion.
     */
    @CreationTimestamp
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    /**
     * Last modification timestamp.
     */
    @UpdateTimestamp
    @Column(
            name = "updated_at"
    )
    private Instant updatedAt;

    /**
     * Optimistic locking.
     *
     * Prevents two concurrent requests from silently overwriting
     * changes to the same transaction.
     */
    @Version
    @Column(
            nullable = false
    )
    private Long version;

    /**
     * Creates a new pending transaction.
     *
     * This is intentionally the only public construction path.
     */
    public static BankTransaction create(
            String fromAccountId,
            String toAccountId,
            BigDecimal amount,
            String description,
            RiskLevel riskLevel
    ) {

        BankTransaction transaction =
                new BankTransaction();

        transaction.transactionId =
                UUID.randomUUID().toString();

        transaction.fromAccountId =
                requireIdentifier(
                        fromAccountId,
                        "Source account"
                );

        transaction.toAccountId =
                requireIdentifier(
                        toAccountId,
                        "Destination account"
                );

        if (transaction.fromAccountId.equals(
                transaction.toAccountId
        )) {
            throw new IllegalArgumentException(
                    "Source and destination accounts must be different"
            );
        }

        transaction.amount =
                validateAmount(amount);

        transaction.description =
                normalizeDescription(description);

        transaction.riskLevel =
                riskLevel;

        transaction.status =
                TransactionStatus.PENDING;

        return transaction;
    }

    /**
     * Updates the risk classification assigned to this transaction.
     *
     * Risk assessment happens before the transaction is finalized.
     */
    public void setRiskLevel(
            RiskLevel riskLevel
    ) {
        this.riskLevel = riskLevel;
    }

    /**
     * Updates the transaction status.
     *
     * The service layer should enforce the allowed state transitions.
     *
     * Keeping this method explicit prevents arbitrary Lombok-generated
     * setters for every field.
     */
    public void setStatus(
            TransactionStatus status
    ) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Transaction status must not be null"
            );
        }

        this.status = status;
    }

    /**
     * Updates the transaction description.
     */
    public void setDescription(
            String description
    ) {

        this.description =
                normalizeDescription(description);
    }

    @PrePersist
    protected void prePersist() {

        if (transactionId == null ||
                transactionId.isBlank()) {

            transactionId =
                    UUID.randomUUID().toString();
        }

        if (status == null) {
            status =
                    TransactionStatus.PENDING;
        }

        validateState();
    }

    @PreUpdate
    protected void preUpdate() {
        validateState();
    }

    private void validateState() {

        requireIdentifier(
                fromAccountId,
                "Source account"
        );

        requireIdentifier(
                toAccountId,
                "Destination account"
        );

        if (fromAccountId.equals(toAccountId)) {
            throw new IllegalStateException(
                    "Source and destination accounts must be different"
            );
        }

        validateAmount(amount);

        if (status == null) {
            throw new IllegalStateException(
                    "Transaction status must not be null"
            );
        }

        if (description != null &&
                description.length() > MAX_DESCRIPTION_LENGTH) {

            throw new IllegalStateException(
                    "Transaction description is too long"
            );
        }
    }

    private static String requireIdentifier(
            String value,
            String field
    ) {

        if (value == null ||
                value.isBlank()) {

            throw new IllegalArgumentException(
                    field + " must not be blank"
            );
        }

        if (value.length() > 36) {
            throw new IllegalArgumentException(
                    field + " identifier is too long"
            );
        }

        return value.trim();
    }

    private static BigDecimal validateAmount(
            BigDecimal amount
    ) {

        if (amount == null) {
            throw new IllegalArgumentException(
                    "Transaction amount must not be null"
            );
        }

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero"
            );
        }

        if (amount.scale() > 2) {
            throw new IllegalArgumentException(
                    "Transaction amount cannot have more than 2 decimal places"
            );
        }

        if (amount.precision() > 19) {
            throw new IllegalArgumentException(
                    "Transaction amount is too large"
            );
        }

        return amount;
    }

    private static String normalizeDescription(
            String description
    ) {

        if (description == null) {
            return null;
        }

        String normalized =
                description.trim();

        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.length() > MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException(
                    "Transaction description is too long"
            );
        }

        return normalized;
    }
}