package com.passwordlessauth.banking.repository;

import com.passwordlessauth.banking.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, String> {
    List<Beneficiary> findByUserIdOrderByCreatedAtDesc(String userId);
}
