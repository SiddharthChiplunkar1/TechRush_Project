package com.passwordlessauth.banking_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.passwordlessauth.banking_service.entity.TransactionEntity;

public interface TransactionRepository extends JpaRepository<TransactionEntity, String>{
	List<TransactionEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
