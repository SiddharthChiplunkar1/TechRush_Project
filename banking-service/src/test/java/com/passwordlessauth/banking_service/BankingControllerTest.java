package com.passwordlessauth.banking_service;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class BankingControllerTest {

    @Test
    void healthEndpointReturnsServiceStatus() {
        BankingController controller = new BankingController();
        Map<String, String> response = controller.health();

        assertEquals("banking-service", response.get("service"));
        assertEquals("up", response.get("status"));
    }
}
