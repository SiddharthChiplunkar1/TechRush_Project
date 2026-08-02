package com.passwordlessauth.repository;

import com.passwordlessauth.entity.LoginHistory;
import com.passwordlessauth.enums.LoginStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for login history records.
 *
 * Uses Spring Data JPA's Pageable (org.springframework.data.domain.Pageable)
 * for paginated history queries. Note: the original scaffolding incorrectly
 * imported java.awt.print.Pageable — that has been corrected here.
 */
@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, String> {

    /** Paginated login history for a user, most recent first. */
    Page<LoginHistory> findByUserUserIdOrderByTimestampDesc(String userId, Pageable pageable);

    /** Count failed logins for a user (used in risk assessment and admin dashboards). */
    long countByUserUserIdAndStatus(String userId, LoginStatus status);

    /** Count failed logins in a time window (for brute-force detection). */
    long countByUserUserIdAndStatusAndTimestampAfter(
            String userId, LoginStatus status, LocalDateTime since);

    /** Login method distribution for admin analytics. */
    @Query("SELECT l.authMethod, COUNT(l) FROM LoginHistory l " +
           "WHERE l.timestamp > :since GROUP BY l.authMethod")
    List<Object[]> getLoginMethodStats(@Param("since") LocalDateTime since);

    /** Total failed logins system-wide in a period (admin dashboard). */
    @Query("SELECT COUNT(l) FROM LoginHistory l WHERE l.status = 'FAILED' " +
           "AND l.timestamp > :since")
    long countFailedLoginsAfter(@Param("since") LocalDateTime since);
}