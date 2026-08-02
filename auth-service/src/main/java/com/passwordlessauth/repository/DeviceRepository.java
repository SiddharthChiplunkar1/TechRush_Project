package com.passwordlessauth.repository;

import com.passwordlessauth.entity.Device;
import com.passwordlessauth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {
    Optional<Device> findByUserAndFingerprint(User user, String fingerprint);
    List<Device> findAllByUser(User user);
    List<Device> findAllByUserAndTrustedTrue(User user);
    boolean existsByUserAndFingerprintAndTrustedTrue(User user, String fingerprint);
}
