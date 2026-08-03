package com.passwordlessauth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.passwordlessauth.dto.responses.DeviceResponse;
import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.User;
import com.passwordlessauth.repository.DeviceRepository;
import com.passwordlessauth.repository.RefreshTokenRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    @Value("${app.security.max-failed-login-attempts:10}")
    private int maxFailedAttempts;

    private final DeviceRepository deviceRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public Device resolveDevice(User user, HttpServletRequest request) {
        String fingerprint = computeFingerprint(request);
        String ipAddress = extractIpAddress(request);

        return deviceRepository.findByUserAndFingerprint(user, fingerprint)
                .map(existing -> {
                    existing.setLastIpAddress(ipAddress);
                    return deviceRepository.save(existing);
                })
                .orElseGet(() -> {
                    Device newDevice = new Device();
                    newDevice.setUser(user);
                    newDevice.setFingerprint(fingerprint);
                    newDevice.setDeviceName(deriveDeviceName(request));
                    newDevice.setDeviceType(deriveDeviceType(request));
                    newDevice.setBrowser(deriveBrowser(request));
                    newDevice.setOperatingSystem(deriveOS(request));
                    newDevice.setLastIpAddress(ipAddress);
                    newDevice.setTrusted(false);
                    log.info("New device registered for user {}", maskUserId(user.getUserId()));
                    return deviceRepository.save(newDevice);
                });
    }

    public boolean isTrustedDevice(User user, HttpServletRequest request) {
        String fingerprint = computeFingerprint(request);
        return deviceRepository.existsByUserAndFingerprintAndTrustedTrue(user, fingerprint);
    }

    public List<DeviceResponse> getUserDevices(User user) {
        return deviceRepository.findAllByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeviceResponse trustDevice(User user, String deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .filter(d -> d.getUser().getUserId().equals(user.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("Device not found"));
        device.setTrusted(true);
        return toResponse(deviceRepository.save(device));
    }

    @Transactional
    public void removeDevice(User user, String deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .filter(d -> d.getUser().getUserId().equals(user.getUserId()))
                .orElseThrow(() -> new IllegalArgumentException("Device not found"));
        refreshTokenRepository.revokeAllDeviceTokens(deviceId);
        deviceRepository.delete(device);
        log.info("Device {} removed for user {}", deviceId, maskUserId(user.getUserId()));
    }

    public String computeFingerprint(HttpServletRequest request) {
        String clientFingerprint = request.getHeader("X-Device-Fingerprint");
        String rawInput;
        if (clientFingerprint != null && !clientFingerprint.isBlank()) {
            rawInput = clientFingerprint;
        } else {
            String userAgent = request.getHeader("User-Agent");
            String acceptLang = request.getHeader("Accept-Language");
            rawInput = (userAgent != null ? userAgent : "") +
                       (acceptLang != null ? "|" + acceptLang : "");
        }
        return sha256(rawInput);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new RuntimeException("SHA-256 not available", ex);
        }
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String deriveDeviceName(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null) return "Unknown Device";
        if (ua.contains("iPhone") || ua.contains("iPad")) return "Apple Mobile";
        if (ua.contains("Android")) return "Android Device";
        if (ua.contains("Windows")) return "Windows PC";
        if (ua.contains("Mac")) return "Mac";
        if (ua.contains("Linux")) return "Linux PC";
        return "Unknown Device";
    }

    private String deriveDeviceType(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null) return "UNKNOWN";
        if (ua.contains("Mobile") || ua.contains("Android") || ua.contains("iPhone")) return "MOBILE";
        if (ua.contains("iPad") || ua.contains("Tablet")) return "TABLET";
        return "DESKTOP";
    }

    private String deriveBrowser(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null) return "Unknown";
        if (ua.contains("Chrome") && !ua.contains("Edg")) return "Chrome";
        if (ua.contains("Firefox")) return "Firefox";
        if (ua.contains("Safari") && !ua.contains("Chrome")) return "Safari";
        if (ua.contains("Edg")) return "Edge";
        return "Other";
    }

    private String deriveOS(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent");
        if (ua == null) return "Unknown";
        if (ua.contains("Windows NT")) return "Windows";
        if (ua.contains("Mac OS X")) return "macOS";
        if (ua.contains("Android")) return "Android";
        if (ua.contains("iPhone") || ua.contains("iPad")) return "iOS";
        if (ua.contains("Linux")) return "Linux";
        return "Other";
    }

    private DeviceResponse toResponse(Device device) {
        return DeviceResponse.builder()
                .deviceId(device.getDeviceId())
                .deviceName(device.getDeviceName())
                .deviceType(device.getDeviceType())
                .browser(device.getBrowser())
                .operatingSystem(device.getOperatingSystem())
                .trusted(device.isTrusted())
                .firstSeen(device.getFirstSeen())
                .lastUsed(device.getLastUsed())
                .build();
    }

    private String maskUserId(String userId) {
        if (userId == null || userId.length() < 8) return "***";
        return userId.substring(0, 4) + "...";
    }
}