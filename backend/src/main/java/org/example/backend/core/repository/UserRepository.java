package org.example.backend.core.repository;

import org.example.backend.core.entity.User;
import org.example.backend.core.entity.types.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findAllByRoleAndIsBlocked(UserRole role, Boolean isBlocked);

    long countByRole(UserRole role);
    long countByIsBlocked(Boolean isBlocked);

    @Query(
        value = """
            SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS count
            FROM users
            WHERE created_at >= :from AND created_at < :to
            GROUP BY 1
            ORDER BY 1
        """,
        nativeQuery = true
    )
    List<MonthlyCount> countNewByMonth(@Param("from") Instant from, @Param("to") Instant to);

    interface MonthlyCount {
        String getMonth();
        Long getCount();
    }
}