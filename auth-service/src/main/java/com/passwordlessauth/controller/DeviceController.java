package com.passwordlessauth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.DeviceResponse;

@RestController
@RequestMapping("/api/devices")
@PreAuthorize("isAuthenticated()")
public class DeviceController {

    @GetMapping
    public ResponseEntity<List<DeviceResponse>> getUserDevices() {
        return ResponseEntity.ok(List.of());
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<Void>> removeDevice(@PathVariable String deviceId) {
        return ResponseEntity.ok(ApiResponse.success("Device removed", null));
    }

    @PutMapping("/{deviceId}/trust")
    public ResponseEntity<ApiResponse<DeviceResponse>> updateDeviceTrust(
            @PathVariable String deviceId,
            @RequestParam boolean isTrusted) {
        return ResponseEntity.ok(ApiResponse.success("Device trust updated", null));
    }
}
