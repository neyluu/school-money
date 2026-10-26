package org.example.backend.core.repository;

import org.example.backend.core.entity.FundraisingContribution;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FundraisingContributionRepository extends JpaRepository<FundraisingContribution, Integer> {
    @Query("""
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.child
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE c.fundraising.id = :fundraisingId
        ORDER BY c.id DESC
        """)
    List<FundraisingContribution> findAllByFundraisingId(
        @Param("fundraisingId") Integer fundraisingId,
        Pageable pageable
    );

    @Query("""
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.transaction
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        ORDER BY c.id
        """)
    List<FundraisingContribution> findAllActiveByFundraisingId(@Param("fundraisingId") Integer fundraisingId);

    @Query("""
        SELECT SUM(c.transaction.amount) FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.child.id = :childId AND c.refundTransaction IS NULL
        """)
    Optional<BigDecimal> sumActiveAmount(
        @Param("fundraisingId") Integer fundraisingId,
        @Param("childId") Integer childId
    );
}
