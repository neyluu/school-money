package org.example.backend.core.repository;

import org.example.backend.core.entity.Transaction;
import org.example.backend.core.entity.types.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.fromWallet.id = :walletId OR t.toWallet.id = :walletId
        ORDER BY t.id DESC
        """)
    List<Transaction> findAllByWalletId(@Param("walletId") Integer walletId, Pageable pageable);

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.type = :type AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
        ORDER BY t.id DESC
        """)
    List<Transaction> findAllByWalletIdAndType(
        @Param("walletId") Integer walletId,
        @Param("type") TransactionType type,
        Pageable pageable
    );

    @Query("""
        SELECT SUM(t.amount) FROM Transaction t
        WHERE t.type = :type AND (t.fromWallet.id = :walletId OR t.toWallet.id = :walletId)
        """)
    Optional<BigDecimal> sumByWalletIdAndType(
        @Param("walletId") Integer walletId,
        @Param("type") TransactionType type
    );
}
