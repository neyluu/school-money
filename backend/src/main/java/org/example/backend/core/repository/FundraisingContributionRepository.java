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
        JOIN FETCH c.fundraising
        JOIN FETCH c.child
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE c.payer.id = :payerId
        ORDER BY c.id DESC
        """)
    List<FundraisingContribution> findAllByPayerId(
        @Param("payerId") Integer payerId,
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

    @Query("""
        SELECT SUM(c.transaction.amount) FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        """)
    Optional<BigDecimal> sumActiveAmountByFundraisingId(@Param("fundraisingId") Integer fundraisingId);

    @Query("""
        SELECT c.child.id AS childId, SUM(c.transaction.amount) AS amount
        FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        GROUP BY c.child.id
        """)
    List<ChildPaidAmount> sumActiveAmountsByChild(@Param("fundraisingId") Integer fundraisingId);

    interface ChildPaidAmount {
        Integer getChildId();

        BigDecimal getAmount();
    }
}
