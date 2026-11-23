package org.example.backend.notifications.repository;

import java.time.Instant;
import java.util.List;
import org.example.backend.core.entity.FundraisingContribution;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository
    extends JpaRepository<FundraisingContribution, Integer>
{
    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.child
        JOIN FETCH c.fundraising f
        JOIN FETCH f.schoolClass sc
        JOIN FETCH c.transaction
        WHERE sc.owner.id = :ownerId
          AND c.refundTransaction IS NULL
          AND c.createdAt > :since
        ORDER BY c.createdAt DESC
        """
    )
    List<FundraisingContribution> findRecentPaymentsForOwner(
        @Param("ownerId") Integer ownerId,
        @Param("since") Instant since,
        Pageable pageable
    );
}
