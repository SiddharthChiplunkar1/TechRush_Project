package com.passwordlessauth.repository;

import com.passwordlessauth.entity.PendingAuthentication;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface PendingAuthenticationRepository extends JpaRepository<PendingAuthentication, String> {
    @Query("select p from PendingAuthentication p where p.challengeId=:id and p.consumed=false and p.expiresAt>:now")
    Optional<PendingAuthentication> findActive(@Param("id") String id, @Param("now") LocalDateTime now);
    @Modifying
    @Query("update PendingAuthentication p set p.consumed=true where p.challengeId=:id and p.consumed=false and p.expiresAt>:now")
    int consume(@Param("id") String id, @Param("now") LocalDateTime now);
}
