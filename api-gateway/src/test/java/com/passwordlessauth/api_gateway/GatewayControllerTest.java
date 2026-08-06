package com.passwordlessauth.api_gateway;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GatewayControllerTest {

    @Test
    void healthEndpointReturnsServiceStatus() {
        GatewayController controller = new GatewayController();
        Map<String, String> response = controller.health();

        assertEquals("api-gateway", response.get("service"));
        assertEquals("up", response.get("status"));
    }
}
