package com.passwordlessauth.controller;

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
import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getUserDevices(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        var user = userRepository.findById(userPrincipal.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
                
        return ResponseEntity.ok(ApiResponse.success(deviceService.getUserDevices(user)));
    }

    @PostMapping("/{deviceId}/trust")
    public ResponseEntity<ApiResponse<DeviceResponse>> trustDevice(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String deviceId) {
            
        var user = userRepository.findById(userPrincipal.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
                
        return ResponseEntity.ok(ApiResponse.success(
                deviceService.trustDevice(user, deviceId)));
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<Void>> removeDevice(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String deviceId) {
            
        var user = userRepository.findById(userPrincipal.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
                
        deviceService.removeDevice(user, deviceId);
        return ResponseEntity.ok(ApiResponse.success("Device removed successfully"));
    }
}
