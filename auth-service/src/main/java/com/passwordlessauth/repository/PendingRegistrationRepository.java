package com.passwordlessauth.repository;

import com.passwordlessauth.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {
}
