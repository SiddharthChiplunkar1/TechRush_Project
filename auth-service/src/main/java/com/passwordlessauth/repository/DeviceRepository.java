package com.passwordlessauth.repository;

import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for trusted device management.
 *
 * The fingerprint is a SHA-256 hash of User-Agent + optional client-supplied
 * device fingerprint header. The uniqueness constraint on (userId, fingerprint)
 * in the Device entity prevents duplicate device registrations.
 */
@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {

    /** Find a device by its hashed fingerprint for a specific user. */
    Optional<Device> findByUserAndFingerprint(User user, String fingerprint);

    /** Get all devices registered to a user (for device management UI). */
    List<Device> findAllByUser(User user);

    /** Get only trusted devices (used in risk assessment). */
    List<Device> findAllByUserAndTrustedTrue(User user);

    /** Check if this exact fingerprint is registered as trusted. */
    boolean existsByUserAndFingerprintAndTrustedTrue(User user, String fingerprint);
}
