package com.passwordlessauth.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    private static final BigDecimal ZERO =
            BigDecimal.ZERO;

    /**
     * Backend-generated account identifier.
     */
    @Id
    @Column(
            name = "account_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String accountId;

    /**
     * Auth Service user identifier that owns this account.
     *
     * One banking account is currently associated with one user.
     */
    @Column(
            name = "user_id",
            nullable = false,
            unique = true,
            updatable = false,
            length = 36
    )
    private String userId;

    /**
     * Monetary balance.
     *
     * precision = total number of digits
     * scale     = number of digits after decimal point
     *
     * 19,2 supports values such as:
     *
     * 99999999999999999.99
     */
    @Column(
            nullable = false,
            precision = 19,
            scale = 2
    )
    @Builder.Default
    private BigDecimal balance = ZERO;

    /**
     * Creation timestamp.
     *
     * Account creation time must not be changed after insertion.
     */
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    /**
     * Optimistic locking version.
     *
     * Prevents silent lost updates when two requests attempt to
     * modify the same account concurrently.
     */
    @Version
    @Column(
            nullable = false
    )
    private Long version;

    /**
     * Initializes backend-owned fields.
     */
    @PrePersist
    protected void prePersist() {

        if (accountId == null || accountId.isBlank()) {
            accountId = UUID.randomUUID().toString();
        }

        if (createdAt == null) {
            createdAt = Instant.now();
        }

        if (balance == null) {
            balance = ZERO;
        }

        validateState();
    }

    /**
     * Credits money to the account.
     *
     * Balance mutations are deliberately kept inside the entity
     * rather than exposing a public setBalance() method.
     */
    public void credit(BigDecimal amount) {

        validateAmount(amount);

        balance = balance.add(amount);
    }

    /**
     * Debits money from the account.
     *
     * The entity itself prevents the balance from becoming negative.
     */
    public void debit(BigDecimal amount) {

        validateAmount(amount);

        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException(
                    "Insufficient account balance"
            );
        }

        balance = balance.subtract(amount);
    }

    /**
     * Returns whether the account has enough funds for the
     * requested debit.
     */
    public boolean hasSufficientBalance(
            BigDecimal amount
    ) {

        validateAmount(amount);

        return balance.compareTo(amount) >= 0;
    }

    private void validateAmount(
            BigDecimal amount
    ) {

        if (amount == null) {
            throw new IllegalArgumentException(
                    "Amount must not be null"
            );
        }

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }
    }

    private void validateState() {

        if (userId == null || userId.isBlank()) {
            throw new IllegalStateException(
                    "Account userId must not be blank"
            );
        }

        if (balance == null) {
            balance = ZERO;
        }

        if (balance.signum() < 0) {
            throw new IllegalStateException(
                    "Account balance cannot be negative"
            );
        }
    }
}