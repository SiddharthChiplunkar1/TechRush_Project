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

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, String> {
    Page<LoginHistory> findByUserUserIdOrderByTimestampDesc(String userId, Pageable pageable);
    long countByUserUserIdAndStatus(String userId, LoginStatus status);
    long countByUserUserIdAndStatusAndTimestampAfter(
            String userId, LoginStatus status, LocalDateTime since);

    @Query("SELECT l.authMethod, COUNT(l) FROM LoginHistory l " +
           "WHERE l.timestamp > :since GROUP BY l.authMethod")
    List<Object[]> getLoginMethodStats(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(l) FROM LoginHistory l WHERE l.status = 'FAILED' " +
           "AND l.timestamp > :since")
    long countFailedLoginsAfter(@Param("since") LocalDateTime since);
}