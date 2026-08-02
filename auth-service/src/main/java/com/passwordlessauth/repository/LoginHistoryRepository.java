package com.passwordlessauth.repository;

import com.passwordlessauth.entity.LoginHistory;
import com.passwordlessauth.enums.LoginStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, String> {
    List<LoginHistory> findByUserUserIdOrderByTimestampDesc(String userId, Pageable pageable);

    long countByUserUserIdAndStatus(String userId, LoginStatus status);

    @Query("SELECT l.authMethod, COUNT(l) FROM LoginHistory l " +
            "WHERE l.timestamp > :since GROUP BY l.authMethod")
    List<Object[]> getLoginMethodStats(LocalDateTime since);
}