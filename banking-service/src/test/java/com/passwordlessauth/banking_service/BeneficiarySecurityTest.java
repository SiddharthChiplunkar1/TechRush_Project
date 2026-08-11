package com.passwordlessauth.banking_service;

import com.passwordlessauth.banking.controller.BeneficiaryController;
import com.passwordlessauth.banking.dto.BeneficiaryDto;
import com.passwordlessauth.banking.entity.Beneficiary;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.BeneficiaryRepository;
import com.passwordlessauth.banking.security.AuthenticatedUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BeneficiarySecurityTest {

    private BeneficiaryRepository repository;
    private BeneficiaryController controller;
    private AuthenticatedUser userA;
    private AuthenticatedUser userB;

    @BeforeEach
    void setUp() {
        repository = mock(BeneficiaryRepository.class);
        controller = new BeneficiaryController(repository);
        userA = new AuthenticatedUser("user-a", "usera@example.com", "USER", "STRONG");
        userB = new AuthenticatedUser("user-b", "userb@example.com", "USER", "STRONG");
    }

    @Test
    void addBeneficiary_cannotAddSelf() {
        BeneficiaryDto selfDto = new BeneficiaryDto(null, "My Self", "user-a", false);

        assertThatThrownBy(() -> controller.add(selfDto, userA))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot add yourself");

        BeneficiaryDto selfEmailDto = new BeneficiaryDto(null, "My Self", "usera@example.com", false);
        assertThatThrownBy(() -> controller.add(selfEmailDto, userA))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot add yourself");
    }

    @Test
    void addBeneficiary_rejectsDuplicate() {
        when(repository.existsByUserIdAndAccountIdentifier("user-a", "acc-123")).thenReturn(true);
        BeneficiaryDto dto = new BeneficiaryDto(null, "John Doe", "acc-123", false);

        assertThatThrownBy(() -> controller.add(dto, userA))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void deleteBeneficiary_foreignIdReturnsNotFound() {
        when(repository.findByIdAndUserId("ben-b", "user-a")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.delete("ben-b", userA))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void toggleFavorite_foreignIdReturnsNotFound() {
        when(repository.findByIdAndUserId("ben-b", "user-a")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.toggleFavorite("ben-b", true, userA))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void addBeneficiary_successForValidBeneficiary() {
        when(repository.existsByUserIdAndAccountIdentifier("user-a", "user-b")).thenReturn(false);
        when(repository.save(any(Beneficiary.class))).thenAnswer(i -> i.getArgument(0));

        BeneficiaryDto dto = new BeneficiaryDto(null, "User B", "user-b", true);
        var response = controller.add(dto, userA);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("User B");
    }
}
