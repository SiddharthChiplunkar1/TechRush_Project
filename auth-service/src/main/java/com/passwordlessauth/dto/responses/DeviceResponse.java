package com.passwordlessauth.dto.responses;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeviceResponse {
    private String deviceId;
    private String deviceName;       // Browser/OS derived
    private String deviceType;       // Mobile, Desktop, Tablet
    private String browser;
    private String operatingSystem;
    private boolean trusted;
    private LocalDateTime firstSeen;
    private LocalDateTime lastUsed;
    private String location;         // Geo-IP derived (approximate)
}
