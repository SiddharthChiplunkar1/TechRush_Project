package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<BankTransaction, String> {
    List<BankTransaction> findByFromAccountIdOrToAccountIdOrderByCreatedAtDesc(String fromAccountId, String toAccountId);
}
