package com.passwordlessauth.banking_service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import java.util.Map;

import org.junit.jupiter.api.Test;

import com.passwordlessauth.banking_service.service.BankingService;

class BankingControllerTest {

    @Test
    void healthEndpointReturnsServiceStatus() {

        BankingService bankingService = mock(BankingService.class);

        BankingController controller =
                new BankingController(bankingService);

        Map<String, String> response = controller.health();

        assertEquals("banking-service", response.get("service"));
        assertEquals("up", response.get("status"));
    }
}