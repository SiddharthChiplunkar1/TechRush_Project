package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.Transaction;
import com.passwordlessauth.banking.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByTimestampDesc(String userId);

    @Query("SELECT COUNT(t) FROM Transaction t " +
            "WHERE t.status = :status AND t.timestamp >= :since")
    long countByStatusAndTimestampSince(
            @Param("status") TransactionStatus status,
            @Param("since") LocalDateTime since
    );
}