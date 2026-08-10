package com.passwordlessauth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

/** Data held only until a registration OTP proves control of the email. */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "pending_registrations")
public class PendingRegistration {
    @Id
    @Column(nullable = false)
    private String email;

    private String firstName;
    private String lastName;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
