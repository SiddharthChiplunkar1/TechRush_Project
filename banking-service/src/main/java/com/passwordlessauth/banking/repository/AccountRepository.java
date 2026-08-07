package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUserId(String userId);
}
