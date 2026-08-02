package com.passwordlessauth.repository;

import com.passwordlessauth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.accountNonLocked = false " +
            "AND u.lockedUntil > :now")
    List<User> findCurrentlyLockedUsers(LocalDateTime now);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt > :since")
    long countUsersCreatedSince(LocalDateTime since);
}
