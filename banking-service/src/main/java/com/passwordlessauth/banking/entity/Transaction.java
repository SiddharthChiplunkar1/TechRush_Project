package com.passwordlessauth.banking.entity;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(
                        name = "idx_tx_user_id",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_tx_timestamp",
                        columnList = "timestamp"
                ),
                @Index(
                        name = "idx_tx_reference",
                        columnList = "transaction_reference"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class Transaction {

    private static final int MAX_USER_ID_LENGTH = 36;
    private static final int MAX_EMAIL_LENGTH = 255;
    private static final int MAX_PAYEE_NAME_LENGTH = 100;
    private static final int MAX_PAYEE_ACCOUNT_LENGTH = 255;
    private static final int MAX_REFERENCE_LENGTH = 36;

    @Id
    @Column(
            name = "id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String id;

    /**
     * Owner of this transaction history record.
     *
     * This must come from authenticated backend context.
     */
    @Column(
            name = "user_id",
            nullable = false,
            updatable = false,
            length = MAX_USER_ID_LENGTH
    )
    private String userId;

    /**
     * Email associated with the transaction at creation time.
     *
     * Stored as historical information rather than being used
     * as the authorization mechanism.
     */
    @Column(
            name = "user_email",
            nullable = false,
            updatable = false,
            length = MAX_EMAIL_LENGTH
    )
    private String userEmail;

    @Column(
            name = "payee_name",
            nullable = false,
            updatable = false,
            length = MAX_PAYEE_NAME_LENGTH
    )
    private String payeeName;

    @Column(
            name = "payee_account",
            nullable = false,
            updatable = false,
            length = MAX_PAYEE_ACCOUNT_LENGTH
    )
    private String payeeAccount;

    /**
     * Monetary transaction amount.
     */
    @Column(
            nullable = false,
            precision = 19,
            scale = 2,
            updatable = false
    )
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private TransactionStatus status;

    /**
     * Risk score recorded when the transaction was evaluated.
     */
    @Column(
            name = "risk_score_at_time",
            nullable = false
    )
    private Integer riskScoreAtTime;

    /**
     * Public/reference identifier connecting this history entry
     * to the underlying transfer where applicable.
     */
    @Column(
            name = "transaction_reference",
            length = MAX_REFERENCE_LENGTH,
            updatable = false
    )
    private String transactionReference;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime timestamp;

    /**
     * Last modification timestamp.
     *
     * Ideally transaction history records should become immutable
     * after completion.
     */
    private LocalDateTime updatedAt;

    /**
     * Protects against concurrent updates to the same history record.
     */
    @Version
    @Column(
            nullable = false
    )
    private Long version;

    /**
     * Backend-controlled factory method.
     */
    public static Transaction create(
            String userId,
            String userEmail,
            String payeeName,
            String payeeAccount,
            BigDecimal amount,
            TransactionStatus status,
            Integer riskScoreAtTime,
            String transactionReference
    ) {

        Transaction transaction =
                new Transaction();

        transaction.id =
                UUID.randomUUID().toString();

        transaction.userId =
                requireText(
                        userId,
                        "User ID",
                        MAX_USER_ID_LENGTH
                );

        transaction.userEmail =
                requireText(
                        userEmail,
                        "User email",
                        MAX_EMAIL_LENGTH
                );

        transaction.payeeName =
                requireText(
                        payeeName,
                        "Payee name",
                        MAX_PAYEE_NAME_LENGTH
                );

        transaction.payeeAccount =
                requireText(
                        payeeAccount,
                        "Payee account",
                        MAX_PAYEE_ACCOUNT_LENGTH
                );

        transaction.amount =
                validateAmount(amount);

        if (status == null) {
            throw new IllegalArgumentException(
                    "Transaction status must not be null"
            );
        }

        transaction.status = status;

        transaction.riskScoreAtTime =
                validateRiskScore(riskScoreAtTime);

        if (transactionReference != null) {
            transaction.transactionReference =
                    requireText(
                            transactionReference,
                            "Transaction reference",
                            MAX_REFERENCE_LENGTH
                    );
        }

        transaction.timestamp =
                LocalDateTime.now();

        return transaction;
    }

    /**
     * Allows controlled status changes.
     *
     * The service layer should enforce valid state transitions.
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

    @PrePersist
    protected void onCreate() {

        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }

        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }

        if (riskScoreAtTime == null) {
            riskScoreAtTime = 0;
        }

        validateState();
    }

    @PreUpdate
    protected void onUpdate() {
        validateState();
    }

    private void validateState() {

        requireText(
                userId,
                "User ID",
                MAX_USER_ID_LENGTH
        );

        requireText(
                userEmail,
                "User email",
                MAX_EMAIL_LENGTH
        );

        requireText(
                payeeName,
                "Payee name",
                MAX_PAYEE_NAME_LENGTH
        );

        requireText(
                payeeAccount,
                "Payee account",
                MAX_PAYEE_ACCOUNT_LENGTH
        );

        validateAmount(amount);

        if (status == null) {
            throw new IllegalStateException(
                    "Transaction status must not be null"
            );
        }

        validateRiskScore(riskScoreAtTime);
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

    private static Integer validateRiskScore(
            Integer riskScore
    ) {

        if (riskScore == null) {
            return 0;
        }

        if (riskScore < 0 || riskScore > 100) {
            throw new IllegalArgumentException(
                    "Risk score must be between 0 and 100"
            );
        }

        return riskScore;
    }

    private static String requireText(
            String value,
            String field,
            int maxLength
    ) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    field + " must not be blank"
            );
        }

        String normalized = value.trim();

        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(
                    field + " is too long"
            );
        }

        return normalized;
    }
}