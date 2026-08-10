package com.passwordlessauth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A short-lived, one-time login continuation. It is never an authenticated session. */
@Entity
@Getter @Setter @NoArgsConstructor
@Table(name = "pending_authentications")
public class PendingAuthentication {
    @Id
    private String challengeId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private String deviceId;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    @Column(nullable = false)
    private boolean consumed;
}
