package com.passwordlessauth.banking_service.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "account_id", nullable = false, updatable = false)
	private UUID accountId;

	@Column(name = "account_user_id", nullable = false, unique = true)
	private String userId;

	@Column(name = "account_balance", precision = 19, scale = 2, nullable = false)
	private BigDecimal balance = BigDecimal.ZERO;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(nullable = false)
	private LocalDateTime updatedAt;
}