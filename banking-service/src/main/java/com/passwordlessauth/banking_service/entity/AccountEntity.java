package com.passwordlessauth.banking_service.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter@Setter@NoArgsConstructor@AllArgsConstructor
@Table(name="accounts")
public class AccountEntity {
	@Column(name="account_user_id",nullable=false,unique=true)
	private String userId;
	@Id
	@GeneratedValue(strategy=GenerationType.UUID)
	private UUID accountId;
	@Column(name="account_balance",precision=19,scale=2)
	private BigDecimal balance;
	@UpdateTimestamp
	private LocalDateTime updatedAt;
	@CreationTimestamp
	private LocalDateTime createdAt;
	
	
}
