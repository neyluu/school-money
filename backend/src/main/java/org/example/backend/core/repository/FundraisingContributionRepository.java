package org.example.backend.core.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.backend.core.entity.FundraisingContribution;
import org.example.backend.core.entity.types.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FundraisingContributionRepository
    extends
        JpaRepository<FundraisingContribution, Integer>,
        JpaSpecificationExecutor<FundraisingContribution>
{
    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.child
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE c.fundraising.id = :fundraisingId
        ORDER BY c.id DESC
        """
    )
    List<FundraisingContribution> findAllByFundraisingId(
        @Param("fundraisingId") Integer fundraisingId,
        Pageable pageable
    );

    @Override
    @EntityGraph(
        attributePaths = {
            "fundraising",
            "child",
            "transaction",
            "refundTransaction",
        }
    )
    Page<FundraisingContribution> findAll(
        Specification<FundraisingContribution> specification,
        Pageable pageable
    );

    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.transaction
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        ORDER BY c.id
        """
    )
    List<FundraisingContribution> findAllActiveByFundraisingId(
        @Param("fundraisingId") Integer fundraisingId
    );

    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.child
        JOIN FETCH c.fundraising f
        JOIN FETCH f.schoolClass
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE c.fundraising.id = :fundraisingId
        ORDER BY c.id
        """
    )
    List<FundraisingContribution> findAllForFundraisingReport(
        @Param("fundraisingId") Integer fundraisingId
    );

    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.child
        JOIN FETCH c.fundraising f
        JOIN FETCH f.schoolClass
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE c.child.id = :childId
        ORDER BY c.id
        """
    )
    List<FundraisingContribution> findAllForChildReport(
        @Param("childId") Integer childId
    );

    @Query(
        """
        SELECT c FROM FundraisingContribution c
        JOIN FETCH c.payer
        JOIN FETCH c.child
        JOIN FETCH c.fundraising f
        JOIN FETCH f.schoolClass sc
        JOIN FETCH c.transaction
        LEFT JOIN FETCH c.refundTransaction
        WHERE sc.id = :classId
        ORDER BY c.id
        """
    )
    List<FundraisingContribution> findAllForClassReport(
        @Param("classId") Integer classId
    );

    @Query(
        """
        SELECT SUM(c.transaction.amount) FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.child.id = :childId AND c.refundTransaction IS NULL
        """
    )
    Optional<BigDecimal> sumActiveAmount(
        @Param("fundraisingId") Integer fundraisingId,
        @Param("childId") Integer childId
    );

    @Query(
        """
        SELECT SUM(c.transaction.amount) FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        """
    )
    Optional<BigDecimal> sumActiveAmountByFundraisingId(
        @Param("fundraisingId") Integer fundraisingId
    );

    @Query(
        """
        SELECT c.child.id AS childId, SUM(c.transaction.amount) AS amount
        FROM FundraisingContribution c
        WHERE c.fundraising.id = :fundraisingId AND c.refundTransaction IS NULL
        GROUP BY c.child.id
        """
    )
    List<ChildPaidAmount> sumActiveAmountsByChild(
        @Param("fundraisingId") Integer fundraisingId
    );

    @Query(
        """
        SELECT c.fundraising.id AS fundraisingId, c.child.id AS childId, SUM(c.transaction.amount) AS amount
        FROM FundraisingContribution c
        WHERE c.child.id IN :childIds AND c.refundTransaction IS NULL
        GROUP BY c.fundraising.id, c.child.id
        """
    )
    List<FundraisingChildPaidAmount> sumActiveAmountsByChildIds(
        @Param("childIds") Collection<Integer> childIds
    );

    @Query(
        """
        SELECT c.fundraising.id AS fundraisingId, c.child.id AS childId, SUM(c.transaction.amount) AS amount
        FROM FundraisingContribution c
        WHERE c.fundraising.id IN :fundraisingIds AND c.refundTransaction IS NULL
        GROUP BY c.fundraising.id, c.child.id
        """
    )
    List<FundraisingChildPaidAmount> sumActiveAmountsByFundraisingIds(
        @Param("fundraisingIds") Collection<Integer> fundraisingIds
    );

    @Query(
        """
            SELECT fc.payer.id AS payerId,
                   fc.child.id AS childId,
                   SUM(t.amount - COALESCE(rt.amount, 0)) AS netPaid
            FROM FundraisingContribution fc
                JOIN fc.transaction t
                LEFT JOIN fc.refundTransaction rt
            WHERE
                fc.fundraising.id = :fundraisingId
                AND t.type = :type
            GROUP BY fc.payer.id, fc.child.id
            HAVING SUM(t.amount - COALESCE(rt.amount, 0)) > :newValue
        """
    )
    List<ChildOverpayment> findOverpaidChildren(
        @Param("fundraisingId") Integer fundraisingId,
        @Param("newValue") BigDecimal newValue,
        @Param("type") TransactionType type
    );

    Optional<FundraisingContribution> findFirstByFundraisingIdAndChildIdAndRefundTransactionIsNullOrderByIdDesc(
        Integer fundraisingId,
        Integer childId
    );

    interface ChildPaidAmount {
        Integer getChildId();

        BigDecimal getAmount();
    }

    interface FundraisingChildPaidAmount {
        Integer getFundraisingId();

        Integer getChildId();

        BigDecimal getAmount();
    }

    interface ChildOverpayment {
        Integer getPayerId();
        Integer getChildId();
        BigDecimal getNetPaid();
    }
}
