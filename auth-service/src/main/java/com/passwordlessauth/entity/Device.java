package com.passwordlessauth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "devices",
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"userId", "fingerprint"}))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(nullable = false)
    private String fingerprint;

    @Column
    private String deviceName;

    @Column
    private String deviceType;

    @Column
    private String browser;

    @Column
    private String operatingSystem;

    @Column(nullable = false)
    private boolean trusted = false;

    @Column
    private String lastIpAddress;

    @Column
    private String lastLocation; // Derived from IP

    @CreationTimestamp
    private LocalDateTime firstSeen;

    @UpdateTimestamp
    private LocalDateTime lastUsed;
}
