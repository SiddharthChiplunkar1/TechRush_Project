package com.passwordlessauth.banking_service.service;
import com.passwordlessauth.banking_service.dto.BankingPrincipal;
import com.passwordlessauth.banking_service.dto.TransferRequest;
import com.passwordlessauth.banking_service.dto.TransferResponse;
import com.passwordlessauth.banking_service.entity.TransactionEntity;
import java.math.BigDecimal;
import java.util.List;

public interface BankingService {
BigDecimal getBalance(String userId);
TransferResponse transfer(BankingPrincipal principal,TransferRequest request);
List<TransactionEntity> getHistory(String userId);

}
