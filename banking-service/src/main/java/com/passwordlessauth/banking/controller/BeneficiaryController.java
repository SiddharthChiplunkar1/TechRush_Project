package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.BeneficiaryDto;
import com.passwordlessauth.banking.entity.Beneficiary;
import com.passwordlessauth.banking.exceptions.NotFoundException;
import com.passwordlessauth.banking.repository.BeneficiaryRepository;
import com.passwordlessauth.banking.security.AuthenticatedUser;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banking/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryRepository beneficiaryRepository;

    public BeneficiaryController(
            BeneficiaryRepository beneficiaryRepository
    ) {
        this.beneficiaryRepository = beneficiaryRepository;
    }

    /**
     * Returns only beneficiaries belonging to the authenticated user.
     *
     * The user ID is obtained exclusively from the JWT principal.
     */
    @GetMapping
    public ResponseEntity<List<BeneficiaryDto>> list(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        AuthenticatedUser authenticatedUser =
                requireAuthenticatedUser(user);

        List<BeneficiaryDto> beneficiaries =
                beneficiaryRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                authenticatedUser.userId()
                        )
                        .stream()
                        .map(this::toDto)
                        .toList();

        return ResponseEntity.ok(beneficiaries);
    }

    /**
     * Creates a beneficiary for the authenticated user.
     *
     * SECURITY:
     * userId is NEVER accepted from the client.
     */
    @PostMapping
    public ResponseEntity<BeneficiaryDto> add(
            @Valid @RequestBody BeneficiaryDto dto,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        AuthenticatedUser authenticatedUser =
                requireAuthenticatedUser(user);

        if (dto.getAccountIdentifier() != null) {
            String identifier = dto.getAccountIdentifier().trim();
            if (identifier.equalsIgnoreCase(authenticatedUser.userId()) ||
                (authenticatedUser.email() != null && identifier.equalsIgnoreCase(authenticatedUser.email()))) {
                throw new IllegalArgumentException("Cannot add yourself as a beneficiary");
            }
            if (beneficiaryRepository.existsByUserIdAndAccountIdentifier(authenticatedUser.userId(), identifier)) {
                throw new IllegalArgumentException("Beneficiary already exists for this account identifier");
            }
        }

        Beneficiary beneficiary =
                Beneficiary.create(
                        authenticatedUser.userId(),
                        dto.getName(),
                        dto.getAccountIdentifier(),
                        dto.isFavourite()
                );

        Beneficiary saved =
                beneficiaryRepository.save(beneficiary);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toDto(saved));
    }

    /**
     * Deletes a beneficiary belonging to the authenticated user.
     *
     * SECURITY:
     * A user cannot delete another user's beneficiary simply by
     * changing the ID in the URL.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        AuthenticatedUser authenticatedUser =
                requireAuthenticatedUser(user);

        if (id == null || id.isBlank()) {
            throw new NotFoundException(
                    "Beneficiary not found"
            );
        }

        Beneficiary beneficiary =
                beneficiaryRepository
                        .findByIdAndUserId(
                                id,
                                authenticatedUser.userId()
                        )
                        .orElseThrow(
                                () -> new NotFoundException(
                                        "Beneficiary not found"
                                )
                        );

        beneficiaryRepository.delete(beneficiary);

        return ResponseEntity.noContent().build();
    }

    /**
     * Updates the favourite state of a beneficiary.
     *
     * Existing API contract is preserved:
     *
     * POST /{id}/favorite?fav=true
     */
    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> toggleFavorite(
            @PathVariable String id,
            @RequestParam("fav") boolean favourite,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        AuthenticatedUser authenticatedUser =
                requireAuthenticatedUser(user);

        if (id == null || id.isBlank()) {
            throw new NotFoundException(
                    "Beneficiary not found"
            );
        }

        Beneficiary beneficiary =
                beneficiaryRepository
                        .findByIdAndUserId(
                                id,
                                authenticatedUser.userId()
                        )
                        .orElseThrow(
                                () -> new NotFoundException(
                                        "Beneficiary not found"
                                )
                        );

        beneficiary.setFavourite(favourite);

        beneficiaryRepository.save(beneficiary);

        return ResponseEntity.noContent().build();
    }

    /**
     * Defensive authentication boundary.
     *
     * SecurityConfig should normally prevent unauthenticated access,
     * but controllers should still avoid NullPointerException if a
     * principal is unexpectedly missing.
     */
    private AuthenticatedUser requireAuthenticatedUser(
            AuthenticatedUser user
    ) {

        if (user == null ||
                user.userId() == null ||
                user.userId().isBlank()) {

            throw new NotFoundException(
                    "Beneficiary not found"
            );
        }

        return user;
    }

    /**
     * Maps the persistence entity to the external DTO.
     *
     * Internal ownership information is intentionally not exposed.
     */
    private BeneficiaryDto toDto(
            Beneficiary beneficiary
    ) {

        BeneficiaryDto dto =
                new BeneficiaryDto();

        dto.setId(
                beneficiary.getId()
        );

        dto.setName(
                beneficiary.getName()
        );

        dto.setAccountIdentifier(
                beneficiary.getAccountIdentifier()
        );

        dto.setFavourite(
                beneficiary.isFavourite()
        );

        return dto;
    }
}
