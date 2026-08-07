package com.passwordlessauth.banking.controller;

import com.passwordlessauth.banking.dto.BeneficiaryDto;
import com.passwordlessauth.banking.entity.Beneficiary;
import com.passwordlessauth.banking.repository.BeneficiaryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/banking/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryRepository beneficiaryRepository;

    public BeneficiaryController(BeneficiaryRepository beneficiaryRepository) {
        this.beneficiaryRepository = beneficiaryRepository;
    }

    @GetMapping
    public ResponseEntity<List<BeneficiaryDto>> list(@RequestParam("userId") String userId) {
        List<Beneficiary> list = beneficiaryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<BeneficiaryDto> dtos = list.stream().map(b -> {
            BeneficiaryDto d = new BeneficiaryDto();
            d.setId(b.getId()); d.setName(b.getName()); d.setAccountIdentifier(b.getAccountIdentifier()); d.setFavourite(b.isFavourite());
            return d;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<BeneficiaryDto> add(@RequestBody BeneficiaryDto dto) {
        Beneficiary b = new Beneficiary();
        b.setUserId(dto.getId() == null ? dto.getAccountIdentifier() : dto.getId()); // preserve if provided
        // Expect client to pass userId in dto.accountIdentifier for simplicity — fix if needed
        b.setName(dto.getName());
        b.setAccountIdentifier(dto.getAccountIdentifier());
        b.setFavourite(dto.isFavourite());
        b = beneficiaryRepository.save(b);
        dto.setId(b.getId());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        beneficiaryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> toggleFavorite(@PathVariable String id, @RequestParam boolean fav) {
        beneficiaryRepository.findById(id).ifPresent(b -> {
            b.setFavourite(fav);
            beneficiaryRepository.save(b);
        });
        return ResponseEntity.ok().build();
    }
}
