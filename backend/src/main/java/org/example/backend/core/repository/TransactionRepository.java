package org.example.backend.core.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionStatus;
import org.example.backend.core.entity.types.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository
    extends
        JpaRepository<Transaction, Integer>,
        JpaSpecificationExecutor<Transaction>
{
    @Query(
        """
        SELECT t FROM Transaction t
        WHERE (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
          AND t.status = :status AND t.completedAt >= :since
        ORDER BY t.completedAt
        """
    )
    List<Transaction> findAllByWalletIdAndStatusSince(
        @Param("walletId") Integer walletId,
        @Param("status") TransactionStatus status,
        @Param("since") Instant since
    );

    @Query(
        """
        SELECT t FROM Transaction t
        WHERE t.type = :type AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
        ORDER BY t.id DESC
        """
    )
    List<Transaction> findAllByWalletIdAndType(
        @Param("walletId") Integer walletId,
        @Param("type") TransactionType type,
        Pageable pageable
    );

    @Query(
        """
        SELECT t FROM Transaction t
        WHERE t.type IN :types AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
        ORDER BY t.id
        """
    )
    List<Transaction> findAllByWalletIdAndTypeIn(
        @Param("walletId") Integer walletId,
        @Param("types") Collection<TransactionType> types
    );

    @Query(
        """
        SELECT SUM(t.amount) FROM Transaction t
        WHERE t.type = :type AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
        """
    )
    Optional<BigDecimal> sumByWalletIdAndType(
        @Param("walletId") Integer walletId,
        @Param("type") TransactionType type
    );

    @Query(
        value = """
            SELECT to_char(date_trunc('month', completed_at), 'YYYY-MM') AS month, SUM(amount) AS turnover
            FROM transactions
            WHERE status = 'COMPLETED'
                AND type IN ('DEPOSIT', 'PAYMENT')
                AND completed_at >= :from AND completed_at < :to
            GROUP BY 1
            ORDER BY 1
        """,
        nativeQuery = true
    )
    List<MonthlyTurnover> turnoverByMonth(@Param("from") Instant from, @Param("to") Instant to);

    interface MonthlyTurnover {
        String getMonth();
        BigDecimal getTurnover();
    }
}
