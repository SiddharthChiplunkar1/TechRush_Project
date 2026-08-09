package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository
        extends JpaRepository<Beneficiary, String> {

    /**
     * Returns all beneficiaries owned by the authenticated user.
     */
    List<Beneficiary> findByUserIdOrderByCreatedAtDesc(
            String userId
    );

    /**
     * Finds a beneficiary only when it belongs to the supplied user.
     *
     * This prevents IDOR by making ownership part of the database query.
     */
    Optional<Beneficiary> findByIdAndUserId(
            String id,
            String userId
    );

    /**
     * Checks whether a beneficiary belongs to a specific user.
     *
     * Useful when only an ownership check is required.
     */
    boolean existsByIdAndUserId(
            String id,
            String userId
    );

    /**
     * Prevents duplicate beneficiaries for the same user and
     * destination identifier.
     */
    boolean existsByUserIdAndAccountIdentifier(
            String userId,
            String accountIdentifier
    );
}