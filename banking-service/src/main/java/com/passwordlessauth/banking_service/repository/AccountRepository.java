package com.passwordlessauth.banking_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.passwordlessauth.banking_service.entity.AccountEntity;

public interface AccountRepository extends JpaRepository<AccountEntity,Long>{
	Optional<AccountEntity> findByUserId(String userId);
}
