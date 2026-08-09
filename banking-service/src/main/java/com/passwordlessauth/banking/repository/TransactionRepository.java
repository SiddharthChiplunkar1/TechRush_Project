package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.BankTransaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<BankTransaction, String> {

    @Query("""
            SELECT t
            FROM BankTransaction t
            WHERE t.fromAccountId = :accountId
               OR t.toAccountId = :accountId
            ORDER BY t.createdAt DESC
            """)
    List<BankTransaction> findByAccountId(
            @Param("accountId") String accountId,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT t
            FROM BankTransaction t
            WHERE t.transactionId = :transactionId
              AND t.fromAccountId = :fromAccountId
            """)
    Optional<BankTransaction> findByTransactionIdAndFromAccountIdForUpdate(
            @Param("transactionId") String transactionId,
            @Param("fromAccountId") String fromAccountId
    );

    @Query("""
            SELECT t
            FROM BankTransaction t
            WHERE t.transactionId = :transactionId
              AND (
                    t.fromAccountId = :accountId
                    OR t.toAccountId = :accountId
              )
            """)
    Optional<BankTransaction> findByIdAndAccountId(
            @Param("transactionId") String transactionId,
            @Param("accountId") String accountId
    );
}