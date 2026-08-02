package com.passwordlessauth;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class AuthControllerTest {

    @Test
    void healthEndpointReturnsServiceStatus() {
        AuthController controller = new AuthController();
        Map<String, String> response = controller.health();

        assertEquals("auth-service", response.get("service"));
        assertEquals("up", response.get("status"));
    }
}
