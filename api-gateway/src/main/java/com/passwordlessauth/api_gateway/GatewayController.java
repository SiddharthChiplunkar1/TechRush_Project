package com.passwordlessauth.api_gateway;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gateway")
public class GatewayController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "api-gateway", "status", "up");
    }
}
