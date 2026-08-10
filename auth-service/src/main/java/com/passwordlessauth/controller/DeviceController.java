package com.passwordlessauth.controller;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.passwordlessauth.dto.responses.ApiResponse;
import com.passwordlessauth.dto.responses.DeviceResponse;
import com.passwordlessauth.security.UserPrincipal;
import com.passwordlessauth.service.DeviceService;
import com.passwordlessauth.exception.UserNotFoundException;
import com.passwordlessauth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getUserDevices(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        requireAuthenticated(principal);

        var user = userRepository.findById(principal.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        return ResponseEntity.ok(
                ApiResponse.success(
                        deviceService.getUserDevices(user)
                )
        );
    }

    @PostMapping("/{deviceId}/trust")
    public ResponseEntity<ApiResponse<DeviceResponse>> trustDevice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @NotBlank String deviceId
    ) {
        requireAuthenticated(principal);

        var user = userRepository.findById(principal.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        return ResponseEntity.ok(
                ApiResponse.success(
                        deviceService.trustDevice(user, deviceId)
                )
        );
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<Void>> removeDevice(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable @NotBlank String deviceId
    ) {
        requireAuthenticated(principal);

        var user = userRepository.findById(principal.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        deviceService.removeDevice(user, deviceId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Device removed successfully"
                )
        );
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Authentication required"
            );
        }
    }
}