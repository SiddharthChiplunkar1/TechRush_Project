package com.passwordlessauth.banking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "beneficiaries",
        indexes = {
                @Index(
                        name = "idx_beneficiary_user_id",
                        columnList = "user_id"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class Beneficiary {

    private static final int MAX_NAME_LENGTH = 100;
    private static final int MAX_ACCOUNT_IDENTIFIER_LENGTH = 255;

    /**
     * Backend-generated beneficiary identifier.
     */
    @Id
    @Column(
            name = "id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String id;

    /**
     * Authenticated user who owns this beneficiary.
     *
     * This must NEVER come from a frontend request.
     */
    @Column(
            name = "user_id",
            nullable = false,
            updatable = false,
            length = 36
    )
    private String userId;

    /**
     * Display name chosen for the beneficiary.
     */
    @Column(
            nullable = false,
            length = MAX_NAME_LENGTH
    )
    private String name;

    /**
     * Beneficiary account identifier.
     *
     * This can currently represent either an email or account ID
     * according to the existing application contract.
     */
    @Column(
            name = "account_identifier",
            nullable = false,
            length = MAX_ACCOUNT_IDENTIFIER_LENGTH
    )
    private String accountIdentifier;

    /**
     * Whether this beneficiary is marked as a favourite.
     */
    @Column(
            nullable = false
    )
    private boolean favourite = false;

    /**
     * Creation timestamp.
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
     * Creates a beneficiary owned by the supplied user.
     *
     * Ownership is explicitly established by the backend.
     */
    public static Beneficiary create(
            String userId,
            String name,
            String accountIdentifier,
            boolean favourite
    ) {

        Beneficiary beneficiary =
                new Beneficiary();

        beneficiary.userId =
                requireIdentifier(
                        userId,
                        "User ID"
                );

        beneficiary.name =
                normalizeName(name);

        beneficiary.accountIdentifier =
                normalizeAccountIdentifier(
                        accountIdentifier
                );

        beneficiary.favourite =
                favourite;

        return beneficiary;
    }

    /**
     * Changes the display name.
     */
    public void rename(String name) {
        this.name = normalizeName(name);
    }

    /**
     * Changes the account identifier.
     *
     * The service layer must ensure that this operation is allowed
     * and that the beneficiary belongs to the authenticated user.
     */
    public void changeAccountIdentifier(
            String accountIdentifier
    ) {
        this.accountIdentifier =
                normalizeAccountIdentifier(
                        accountIdentifier
                );
    }

    /**
     * Explicitly sets favourite state.
     */
    public void setFavourite(boolean favourite) {
        this.favourite = favourite;
    }

    /**
     * Toggles favourite state.
     */
    public void toggleFavourite() {
        this.favourite = !this.favourite;
    }

    @PrePersist
    protected void prePersist() {

        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }

        validateState();
    }

    @PreUpdate
    protected void preUpdate() {
        validateState();
    }

    private void validateState() {

        requireIdentifier(
                userId,
                "User ID"
        );

        normalizeName(name);

        normalizeAccountIdentifier(
                accountIdentifier
        );
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
                    field + " is too long"
            );
        }

        return value.trim();
    }

    private static String normalizeName(
            String name
    ) {

        if (name == null ||
                name.isBlank()) {

            throw new IllegalArgumentException(
                    "Beneficiary name must not be blank"
            );
        }

        String normalized =
                name.trim();

        if (normalized.length() > MAX_NAME_LENGTH) {
            throw new IllegalArgumentException(
                    "Beneficiary name is too long"
            );
        }

        return normalized;
    }

    private static String normalizeAccountIdentifier(
            String accountIdentifier
    ) {

        if (accountIdentifier == null ||
                accountIdentifier.isBlank()) {

            throw new IllegalArgumentException(
                    "Account identifier must not be blank"
            );
        }

        String normalized =
                accountIdentifier.trim();

        if (normalized.length() >
                MAX_ACCOUNT_IDENTIFIER_LENGTH) {

            throw new IllegalArgumentException(
                    "Account identifier is too long"
            );
        }

        return normalized;
    }
}